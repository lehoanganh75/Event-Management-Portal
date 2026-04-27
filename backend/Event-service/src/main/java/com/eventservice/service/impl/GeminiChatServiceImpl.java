package com.eventservice.service.impl;

import com.eventservice.dto.EventPlanSuggestion;
import com.eventservice.dto.ProgramItemSuggestion;
import com.eventservice.entity.ChatMessage;
import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.service.GeminiChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatServiceImpl implements GeminiChatService {
    
    @Value("${gemini.api.key:}")
    private String geminiApiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String geminiApiUrl;
    
    private final ObjectMapper objectMapper;
    
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();
    
    @Override
    public String generateChatResponse(String userMessage, List<ChatMessage> conversationHistory, String contextType) {
        try {
            String systemPrompt = buildSystemPrompt(contextType);
            String conversationContext = buildConversationContext(conversationHistory);
            
            String fullPrompt = String.format("""
                %s
                
                Lịch sử hội thoại:
                %s
                
                Người dùng: %s
                
                Trợ lý AI:""", systemPrompt, conversationContext, userMessage);
            
            return callGeminiAPI(fullPrompt);
            
        } catch (Exception e) {
            log.error("Error generating chat response: {}", e.getMessage(), e);
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
        }
    }
    
    @Override
    public EventPlanSuggestion generateEventPlanSuggestion(String userInput, List<ChatMessage> conversationHistory) {
        try {
            String conversationContext = buildConversationContext(conversationHistory);
            
            String prompt = String.format("""
                Bạn là chuyên gia tổ chức sự kiện của trường Đại học Công nghiệp TP.HCM (IUH).
                
                Dựa trên cuộc hội thoại sau, hãy tạo một kế hoạch sự kiện chi tiết:
                
                %s
                
                Yêu cầu mới nhất: %s
                
                Hãy trả về kế hoạch sự kiện dưới dạng JSON với cấu trúc sau:
                {
                  "title": "Tên sự kiện",
                  "subject": "Chủ đề",
                  "purpose": "Mục đích",
                  "description": "Mô tả chi tiết",
                  "suggestedStartTime": "2024-12-20T09:00:00",
                  "suggestedEndTime": "2024-12-20T17:00:00",
                  "suggestedLocation": "Địa điểm",
                  "estimatedParticipants": 100,
                  "programItems": [
                    {
                      "title": "Tên chương trình",
                      "description": "Mô tả",
                      "startTime": "09:00",
                      "endTime": "10:00",
                      "durationMinutes": 60,
                      "speaker": "Diễn giả",
                      "location": "Phòng A",
                      "notes": "Ghi chú"
                    }
                  ],
                  "requiredResources": ["Máy chiếu", "Micro", "Bàn ghế"],
                  "teamRoles": ["MC", "Kỹ thuật", "Hậu cần"],
                  "confidenceScore": 0.85,
                  "reasoning": "Lý do đề xuất"
                }
                
                Chỉ trả về JSON, không thêm text khác.
                """, conversationContext, userInput);
            
            String jsonResponse = callGeminiAPI(prompt);
            return parseEventPlanSuggestion(jsonResponse);
            
        } catch (Exception e) {
            log.error("Error generating event plan suggestion: {}", e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    public String analyzeUserIntent(String message) {
        try {
            String prompt = String.format("""
                Phân tích ý định của người dùng từ tin nhắn sau:
                "%s"
                
                Trả về DUY NHẤT một trong các ý định sau (không có ký tự lạ, không giải thích):
                - EVENT_PLANNING: Muốn lập kế hoạch sự kiện
                - EVENT_INQUIRY: Hỏi về sự kiện
                - REGISTRATION_HELP: Cần hỗ trợ đăng ký
                - GENERAL_QUESTION: Câu hỏi chung
                - FEEDBACK: Phản hồi/góp ý
                """, message);
            
            String result = callGeminiAPI(prompt).trim().toUpperCase();
            log.info("Raw intent analysis result: {}", result);

            // Robust intent matching
            if (result.contains("EVENT_PLANNING")) return "EVENT_PLANNING";
            if (result.contains("EVENT_INQUIRY")) return "EVENT_INQUIRY";
            if (result.contains("REGISTRATION") || result.contains("ĐĂNG KÝ")) return "REGISTRATION_HELP";
            if (result.contains("FEEDBACK") || result.contains("GÓP Ý")) return "FEEDBACK";
            
            return "GENERAL_QUESTION";
            
        } catch (Exception e) {
            log.error("Error analyzing user intent: {}", e.getMessage());
            return "GENERAL_QUESTION";
        }
    }
    
    @Override
    public List<String> generateQuickReplies(String lastMessage, String contextType) {
        try {
            String prompt = String.format("""
                Dựa trên tin nhắn: "%s"
                Và ngữ cảnh: %s
                
                Hãy đề xuất 3 câu trả lời nhanh phù hợp mà người dùng có thể chọn.
                Mỗi câu trả lời trên một dòng, không đánh số.
                """, lastMessage, contextType);
            
            String response = callGeminiAPI(prompt);
            return List.of(response.split("\n"));
            
        } catch (Exception e) {
            log.error("Error generating quick replies: {}", e.getMessage(), e);
            return List.of("Có", "Không", "Cho tôi biết thêm");
        }
    }
    
    @Override
    public boolean isEventPlanningRelated(String message) {
        String lowerMessage = message.toLowerCase();
        return lowerMessage.contains("sự kiện") || 
               lowerMessage.contains("kế hoạch") ||
               lowerMessage.contains("tổ chức") ||
               lowerMessage.contains("event") ||
               lowerMessage.contains("hội thảo") ||
               lowerMessage.contains("workshop") ||
               lowerMessage.contains("seminar");
    }
    
    @Override
    public EventPlanSuggestion extractEventDetails(String naturalLanguageInput) {
        try {
            String prompt = String.format("""
                Trích xuất thông tin sự kiện từ văn bản sau:
                "%s"
                
                Trả về JSON với cấu trúc:
                {
                  "title": "Tên sự kiện (nếu có)",
                  "subject": "Chủ đề",
                  "purpose": "Mục đích",
                  "description": "Mô tả",
                  "suggestedStartTime": "ISO datetime hoặc null",
                  "suggestedEndTime": "ISO datetime hoặc null",
                  "suggestedLocation": "Địa điểm hoặc null",
                  "estimatedParticipants": số người hoặc null,
                  "confidenceScore": 0.0-1.0
                }
                
                Chỉ trả về JSON.
                """, naturalLanguageInput);
            
            String jsonResponse = callGeminiAPI(prompt);
            return parseEventPlanSuggestion(jsonResponse);
            
        } catch (Exception e) {
            log.error("Error extracting event details: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // ==================== PRIVATE HELPER METHODS ====================
    
    private String buildSystemPrompt(String contextType) {
        String basePrompt = """
            Bạn là trợ lý AI thông minh của hệ thống quản lý sự kiện trường Đại học Công nghiệp TP.HCM (IUH).
            
            QUYỀN HẠN CỦA BẠN:
            - Bạn được tích hợp trực tiếp với Cơ sở dữ liệu của hệ thống.
            - Bạn có khả năng truy xuất thông tin thời gian thực về tất cả sự kiện đang diễn ra, sắp diễn ra và đã kết thúc.
            
            NHIỆM VỤ CHÍNH:
            - PHÂN TÍCH sự kiện dựa trên dữ liệu thật (tên, mục tiêu, diễn giả, nội dung).
            - TRẢ LỜI chính xác về thời gian, địa điểm, yêu cầu tham gia.
            - GỢI Ý các sự kiện phù hợp dựa trên nhu cầu của người dùng.
            - HỖ TRỢ lập kế hoạch sự kiện chuẩn IUH.
            
            NGUYÊN TẮC TRẢ LỜI:
            - ƯU TIÊN TUYỆT ĐỐI dữ liệu được cung cấp trong phần "DỮ LIỆU SỰ KIỆN TỪ DATABASE".
            - Nếu user hỏi "có gì hot", hãy phân tích các sự kiện "Featured" hoặc "Ongoing" trong dữ liệu.
            - Nếu không có dữ liệu phù hợp, hãy thông báo rõ và liệt kê danh sách sự kiện đang có.
            - KHÔNG ĐƯỢC bịa đặt thông tin không có trong database.
            - Trình bày đẹp mắt bằng Emoji và Markdown (Bullet points, In đậm).
            
            PHONG CÁCH:
            - Chuyên nghiệp nhưng thân thiện.
            - Luôn sẵn sàng hỗ trợ sinh viên và giảng viên IUH.
            """;
        
        return switch (contextType) {
            case "EVENT_PLANNING" -> basePrompt + """
                
                Ngữ cảnh hiện tại: Người dùng đang lập kế hoạch sự kiện.
                Hãy tập trung vào:
                - Hỏi thông tin cần thiết (tên, thời gian, địa điểm, số người)
                - Đề xuất chương trình sự kiện phù hợp
                - Gợi ý nguồn lực cần thiết
                - Hướng dẫn quy trình phê duyệt
                """;
            case "EVENT_INQUIRY" -> basePrompt + """
                
                Ngữ cảnh hiện tại: Người dùng đang tìm hiểu về sự kiện.
                Hãy cung cấp thông tin chi tiết về sự kiện từ dữ liệu database.
                """;
            default -> basePrompt;
        };
    }
    
    private String buildConversationContext(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return "(Chưa có lịch sử hội thoại)";
        }
        
        StringBuilder context = new StringBuilder();
        for (ChatMessage msg : history) {
            String role = msg.getRole() == ChatMessageRole.USER ? "Người dùng" : "Trợ lý";
            context.append(String.format("%s: %s\n", role, msg.getContent()));
        }
        
        return context.toString();
    }
    
    private String callGeminiAPI(String prompt) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.warn("Gemini API key not configured, returning fallback response");
            return "Xin lỗi, dịch vụ AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }

        // Build correct Gemini API request body
        String requestBody = String.format("""
                {
                  "contents": [
                    {
                      "parts": [
                        { "text": %s }
                      ]
                    }
                  ],
                  "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048
                  }
                }
                """, objectMapper.writeValueAsString(prompt));

        Request request = new Request.Builder()
                .url(geminiApiUrl + "?key=" + geminiApiKey)
                .post(RequestBody.create(requestBody, MediaType.parse("application/json")))
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "no body";
                log.error("Gemini API call failed with status: {} and body: {}", response.code(), errorBody);
                
                if (response.code() == 429) {
                    return "Xin lỗi, hiện tại tốc độ yêu cầu AI đang quá nhanh (Rate Limit). Vui lòng thử lại sau 30 giây.";
                }
                
                throw new RuntimeException("Gemini API call failed with status " + response.code());
            }
            
            String responseBody = response.body().string();
            if (responseBody == null || responseBody.isBlank()) {
                log.error("Gemini API returned an empty response body");
                throw new RuntimeException("Empty response from AI");
            }
            
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            // Check for API errors in response body
            if (jsonNode.has("error")) {
                String errMsg = jsonNode.path("error").path("message").asText("Unknown error");
                log.error("Gemini API returned Error: {}", errMsg);
                throw new RuntimeException("Gemini API Error: " + errMsg);
            }

            JsonNode textNode = jsonNode.at("/candidates/0/content/parts/0/text");
            if (textNode.isMissingNode()) {
                log.warn("Gemini API response candidate 0 text is missing. Full response: {}", responseBody);
                return "Tôi không thể xử lý nội dung này (AI safety filter hoặc lỗi response).";
            }
            
            String text = textNode.asText().trim();
            if (text.isEmpty()) {
                log.warn("Gemini API returned empty text. Response body: {}", responseBody);
                return "Tôi đã nhận được yêu cầu nhưng không thể tạo ra câu trả lời phù hợp lúc này.";
            }
            
            return text;
        } catch (Exception e) {
            log.error("Critical error during Gemini API call: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    private EventPlanSuggestion parseEventPlanSuggestion(String jsonResponse) {
        try {
            // Remove markdown code blocks if present
            String cleanJson = jsonResponse.replaceAll("```json\\n?", "").replaceAll("```", "").trim();
            
            JsonNode root = objectMapper.readTree(cleanJson);
            
            EventPlanSuggestion suggestion = EventPlanSuggestion.builder()
                    .title(root.path("title").asText(null))
                    .subject(root.path("subject").asText(null))
                    .purpose(root.path("purpose").asText(null))
                    .description(root.path("description").asText(null))
                    .suggestedLocation(root.path("suggestedLocation").asText(null))
                    .estimatedParticipants(root.path("estimatedParticipants").asInt(0))
                    .confidenceScore(root.path("confidenceScore").asDouble(0.0))
                    .reasoning(root.path("reasoning").asText(null))
                    .build();
            
            // Parse datetime
            if (root.has("suggestedStartTime") && !root.path("suggestedStartTime").isNull()) {
                suggestion.setSuggestedStartTime(LocalDateTime.parse(root.path("suggestedStartTime").asText()));
            }
            if (root.has("suggestedEndTime") && !root.path("suggestedEndTime").isNull()) {
                suggestion.setSuggestedEndTime(LocalDateTime.parse(root.path("suggestedEndTime").asText()));
            }
            
            // Parse program items
            if (root.has("programItems")) {
                List<ProgramItemSuggestion> items = new ArrayList<>();
                root.path("programItems").forEach(item -> {
                    ProgramItemSuggestion programItem = ProgramItemSuggestion.builder()
                            .title(item.path("title").asText())
                            .description(item.path("description").asText())
                            .durationMinutes(item.path("durationMinutes").asInt())
                            .speaker(item.path("speaker").asText(null))
                            .location(item.path("location").asText(null))
                            .notes(item.path("notes").asText(null))
                            .build();
                    
                    if (item.has("startTime")) {
                        programItem.setStartTime(LocalTime.parse(item.path("startTime").asText()));
                    }
                    if (item.has("endTime")) {
                        programItem.setEndTime(LocalTime.parse(item.path("endTime").asText()));
                    }
                    
                    items.add(programItem);
                });
                suggestion.setProgramItems(items);
            }
            
            // Parse arrays
            if (root.has("requiredResources")) {
                List<String> resources = new ArrayList<>();
                root.path("requiredResources").forEach(r -> resources.add(r.asText()));
                suggestion.setRequiredResources(resources);
            }
            
            if (root.has("teamRoles")) {
                List<String> roles = new ArrayList<>();
                root.path("teamRoles").forEach(r -> roles.add(r.asText()));
                suggestion.setTeamRoles(roles);
            }
            
            return suggestion;
            
        } catch (Exception e) {
            log.error("Error parsing event plan suggestion: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // ==================== END ====================
}
