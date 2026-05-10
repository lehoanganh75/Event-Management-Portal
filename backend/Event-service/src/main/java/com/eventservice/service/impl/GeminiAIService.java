package com.eventservice.service.impl;

import com.eventservice.entity.core.Event;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${deepseek.api.key}")
    private String deepseekApiKey;

    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .build();

    /**
     * Phân tích nội dung sự kiện và trích xuất thông tin có cấu trúc
     */
    public String analyzeEventContent(String content) {
        String prompt = String.format("""
            Bạn là chuyên gia phân tích sự kiện. Hãy phân tích nội dung sau và trích xuất thông tin theo định dạng JSON.
            
            NỘI DUNG:
            %s
            
            YÊU CẦU JSON OUTPUT:
            {
              "title": "Tiêu đề hấp dẫn",
              "subject": "Chủ đề chính",
              "purpose": "Mục tiêu tổ chức",
              "location": "Địa điểm dự kiến",
              "startTime": "YYYY-MM-DDTHH:mm",
              "endTime": "YYYY-MM-DDTHH:mm",
              "targetAudience": "Đối tượng tham gia",
              "estimatedParticipants": 100
            }
            """, content);

        return callGemini(prompt);
    }

    /**
     * Tạo bài viết truyền thông (Event Post) từ thông tin sự kiện
     */
    public String generateEventPost(Event event, String tone) {
        String prompt = String.format("""
            Hãy viết một bài đăng Facebook/Web hấp dẫn cho sự kiện sau. 
            Giọng văn: %s
            
            THÔNG TIN SỰ KIỆN:
            - Tiêu đề: %s
            - Địa điểm: %s
            - Thời gian: %s
            - Mô tả: %s
            
            YÊU CẦU:
            - Có tiêu đề bắt mắt (Hook)
            - Có các icon/emoji phù hợp
            - Có lời kêu gọi hành động (CTA)
            - Trình bày rõ ràng bằng HTML hoặc Markdown
            """, 
            tone != null ? tone : "hào hứng",
            event.getTitle(),
            event.getLocation(),
            event.getStartTime(),
            event.getDescription());

        return callGemini(prompt);
    }

    /**
     * Rà soát và đề xuất cải thiện thông tin sự kiện
     */
    public String reanalyzeEvent(Event event) {
        String prompt = String.format("""
            Hãy rà soát thông tin sự kiện sau và đề xuất cải thiện (Tiêu đề hay hơn, Mục đích rõ ràng hơn, Đối tượng cụ thể hơn).
            
            THÔNG TIN HIỆN TẠI:
            - Tiêu đề: %s
            - Chủ đề: %s
            - Mục đích: %s
            - Đối tượng: %s
            
            YÊU CẦU:
            Trả về đề xuất cải thiện dưới dạng Markdown.
            """, 
            event.getTitle(),
            event.getDescription(), // Giả sử description là subject
            "Chưa rõ",
            "Chưa rõ");

        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        // Only Gemini 2.5 Flash + 3.1 Flash-Lite (NO 1.5/1.0)
        String[] models = {"gemini-2.5-flash", "gemini-3.1-flash-lite"};
        
        for (String model : models) {
            try {
                // Try v1beta first (newer models), then v1
                String result = callDirect(prompt, model, "v1beta");
                if (result == null) {
                    result = callDirect(prompt, model, "v1");
                }
                
                if (result != null) {
                    return result;
                }
            } catch (Exception e) {
                log.warn("Gemini model {} failed, trying next...", model);
            }
        }

        return callDeepSeekFallback(prompt);
    }

    private String callDirect(String prompt, String modelName, String apiVersion) {
        String url = String.format("https://generativelanguage.googleapis.com/%s/models/%s:generateContent?key=%s", 
                apiVersion, modelName, geminiApiKey);
        try {
            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> bodyMap = Map.of("contents", List.of(content));
            String requestBody = objectMapper.writeValueAsString(bodyMap);

            Request request = new Request.Builder()
                    .url(url)
                    .post(RequestBody.create(requestBody, MediaType.parse("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    String body = response.body().string();
                    JsonNode root = objectMapper.readTree(body);
                    return root.at("/candidates/0/content/parts/0/text").asText(null);
                }
                return null;
            }
        } catch (Exception e) {
            return null;
        }
    }

    private String callDeepSeekFallback(String prompt) {
        try {
            log.info("Using DeepSeek as AI fallback");
            String url = "https://api.deepseek.com/v1/chat/completions";
            Map<String, Object> message = Map.of("role", "user", "content", prompt);
            Map<String, Object> bodyMap = new LinkedHashMap<>();
            bodyMap.put("model", "deepseek-chat");
            bodyMap.put("messages", List.of(message));
            bodyMap.put("max_tokens", 4096);
            bodyMap.put("temperature", 0.4);

            String requestBody = objectMapper.writeValueAsString(bodyMap);
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + deepseekApiKey)
                    .post(RequestBody.create(requestBody, MediaType.parse("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("DeepSeek fallback HTTP {}", response.code());
                    return "Xin lỗi, tôi không thể xử lý yêu cầu lúc này.";
                }
                String responseBody = response.body().string();
                JsonNode root = objectMapper.readTree(responseBody);
                return root.at("/choices/0/message/content").asText("Xin lỗi, tôi không thể xử lý yêu cầu lúc này.");
            }
        } catch (Exception e) {
            log.error("DeepSeek fallback also failed: ", e);
            return "Xin lỗi, tôi không thể xử lý yêu cầu phân tích lúc này.";
        }
    }
}
