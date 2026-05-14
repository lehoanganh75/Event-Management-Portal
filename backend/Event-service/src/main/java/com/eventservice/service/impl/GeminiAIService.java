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

    /**
     * Kiểm tra nội dung bình luận xem có khiếm nhã/tiêu cực không
     */
    public boolean isContentOffensive(String content) {
        if (content == null || content.trim().isEmpty()) return false;
        
        // --- Layer 1: Fast local filter for extreme profanities ---
        String lowerContent = content.toLowerCase();
        List<String> blackList = Arrays.asList("con cặc", "đụ má", "vãi lồn", "đéo", "chửi thề", "clm", "vcl");
        for (String word : blackList) {
            if (lowerContent.contains(word)) {
                log.info("Local filter blocked offensive content: '{}'", content);
                return true;
            }
        }

        // --- Layer 2: AI Moderation ---
        String prompt = String.format("""
            Hãy đóng vai trò là một hệ thống kiểm duyệt nội dung tiếng Việt nghiêm ngặt.
            Phân tích bình luận sau đây và quyết định xem nó có chứa ngôn từ khiếm nhã, chửi bậy, tục tĩu, xúc phạm cá nhân, thù ghét, đe dọa, hoặc vi phạm chuẩn mực cộng đồng không.
            Nếu nội dung vi phạm, chỉ trả về đúng một từ duy nhất: REJECT
            Nếu nội dung an toàn và bình thường, chỉ trả về đúng một từ duy nhất: APPROVE
            
            BÌNH LUẬN CẦN KIỂM TRA:
            "%s"
            """, content);

        String result = callGemini(prompt);
        log.info("AI Moderation result for '{}': {}", content, result);
        
        if (result == null) return false;
        String normalized = result.trim().toUpperCase();
        
        // Nếu AI trả về REJECT hoặc chứa REJECT thì chặn
        return normalized.contains("REJECT");
    }

    private String callGemini(String prompt) {
        String aiUrl = "http://ai-event-management:3000/api/chat";
        log.info("GeminiAIService redirecting to Local AI: {}", aiUrl);

        try {
            Map<String, String> bodyMap = Map.of("prompt", prompt);
            String requestBody = objectMapper.writeValueAsString(bodyMap);

            Request request = new Request.Builder()
                    .url(aiUrl)
                    .post(RequestBody.create(requestBody, MediaType.parse("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Local AI failed with code: {}", response.code());
                    return "Lỗi AI (Node.js): " + response.code();
                }
                
                String responseBody = response.body().string();
                JsonNode root = objectMapper.readTree(responseBody);
                
                // Parse nested structure: { "reply": { "reply": "..." } } OR { "reply": "..." }
                JsonNode replyNode = root.get("reply");
                if (replyNode.isObject() && replyNode.has("reply")) {
                    return replyNode.get("reply").asText();
                }
                return replyNode.asText();
            }
        } catch (Exception e) {
            log.error("AI Analysis error: ", e);
            return "Xin lỗi, tôi không thể xử lý yêu cầu phân tích lúc này qua Local AI.";
        }
    }
}
