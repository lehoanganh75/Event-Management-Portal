package com.eventservice.service.impl;

import com.eventservice.entity.template.EventTemplate;
import com.eventservice.repository.EventTemplateRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateRecommendationService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private final EventTemplateRepository templateRepository;
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();

    private static final String EMBEDDING_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

    /**
     * Gợi ý bản mẫu dựa trên mô tả của người dùng
     */
    public List<EventTemplate> recommendTemplates(String userDescription, int limit) {
        if (userDescription == null || userDescription.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            // 1. Tạo embedding cho mô tả của người dùng
            List<Double> userEmbedding = generateEmbedding(userDescription.trim());
            
            // 2. Lấy tất cả bản mẫu công khai
            List<EventTemplate> allTemplates = templateRepository.findAll().stream()
                    .filter(t -> !t.isDeleted() && t.isPublic())
                    .collect(Collectors.toList());

            // 3. Tính toán độ tương đồng Cosine và sắp xếp
            return allTemplates.stream()
                    .filter(t -> t.getEmbedding() != null && !t.getEmbedding().isEmpty())
                    .sorted((a, b) -> {
                        double simA = cosineSimilarity(userEmbedding, a.getEmbedding());
                        double simB = cosineSimilarity(userEmbedding, b.getEmbedding());
                        return Double.compare(simB, simA);
                    })
                    .limit(limit)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error recommending templates: ", e);
            // Fallback: Tìm kiếm theo từ khóa đơn giản
            return templateRepository.findAll().stream()
                    .filter(t -> !t.isDeleted() && t.isPublic() && 
                            (t.getTemplateName().toLowerCase().contains(userDescription.toLowerCase()) || 
                             t.getDescription().toLowerCase().contains(userDescription.toLowerCase())))
                    .limit(limit)
                    .collect(Collectors.toList());
        }
    }

    /**
     * Tạo và lưu Embedding cho một bản mẫu
     */
    public void generateAndSaveEmbedding(EventTemplate template) {
        try {
            String text = (template.getTemplateName() + " " + template.getDescription()).trim();
            List<Double> embedding = generateEmbedding(text);
            template.setEmbedding(embedding);
            template.setEmbeddingGeneratedAt(LocalDateTime.now());
            templateRepository.save(template);
            log.info("Generated embedding for template: {}", template.getTemplateName());
        } catch (Exception e) {
            log.error("Failed to generate embedding for template: {}", template.getId(), e);
        }
    }

    public List<Double> generateEmbedding(String text) throws Exception {
        String url = EMBEDDING_API_URL + "?key=" + geminiApiKey;

        Map<String, Object> contentPart = Map.of("text", text);
        Map<String, Object> content = Map.of("parts", List.of(contentPart));
        Map<String, Object> requestBody = Map.of(
                "model", "models/text-embedding-004",
                "content", content
        );

        String json = objectMapper.writeValueAsString(requestBody);
        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(json, MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Embedding API failed: " + response.code());
            }
            JsonNode root = objectMapper.readTree(response.body().string());
            JsonNode values = root.at("/embedding/values");
            
            List<Double> embedding = new ArrayList<>();
            for (JsonNode val : values) {
                embedding.add(val.asDouble());
            }
            return embedding;
        }
    }

    private double cosineSimilarity(List<Double> vec1, List<Double> vec2) {
        if (vec1 == null || vec2 == null || vec1.size() != vec2.size()) return 0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vec1.size(); i++) {
            dotProduct += vec1.get(i) * vec2.get(i);
            normA += Math.pow(vec1.get(i), 2);
            normB += Math.pow(vec2.get(i), 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
