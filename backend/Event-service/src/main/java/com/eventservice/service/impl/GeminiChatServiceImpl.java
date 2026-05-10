package com.eventservice.service.impl;

import com.eventservice.dto.EventPlanSuggestion;
import com.eventservice.dto.ProgramItemSuggestion;
import com.eventservice.entity.social.ChatMessage;
import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.service.GeminiChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatServiceImpl implements GeminiChatService {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private ChatClient chatClient; // DeepSeek fallback via Spring AI

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .build();


    @Override
    public String generateChatResponse(String userMessage, List<ChatMessage> conversationHistory, String contextType) {
        try {
            // 0. Check for default responses for common questions
            String defaultResponse = getCommonResponse(userMessage);
            if (defaultResponse != null) {
                log.info("Returning default response for message: {}", userMessage);
                return defaultResponse;
            }

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
            return "ERROR_AI_OVERLOADED";
        }
    }

    @Override
    public EventPlanSuggestion generateEventPlanSuggestion(String userInput, List<ChatMessage> conversationHistory) {
        try {
            String conversationContext = buildConversationContext(conversationHistory);

            String prompt = String.format(
                    """
                            [ROLE]
                            Bạn là Chuyên gia Tư vấn Tổ chức Sự kiện cao cấp (Event Architect).

                            [GOAL]
                            Dựa trên hội thoại và yêu cầu của người dùng, hãy thiết lập một bản kế hoạch sự kiện chuyên nghiệp, khả thi và chi tiết.

                            [CONTEXT]
                            Lịch sử hội thoại: %s
                            Yêu cầu mới nhất: %s

                            [RULES]
                            - Luôn trả lời bằng JSON hợp lệ.
                            - Không bịa thông tin về địa điểm thực tế nếu không có trong dữ liệu.
                            - Thời gian phải logic (Start < End).
                            - ProgramItems phải bao quát toàn bộ tiến trình sự kiện.
                            - ConfidenceScore phản ánh mức độ đầy đủ của thông tin người dùng cung cấp.

                            [OUTPUT FORMAT - JSON ONLY]
                            {
                              "title": "Tên sự kiện",
                              "subject": "Chủ đề chính",
                              "purpose": "Mục đích chiến lược",
                              "description": "Mô tả chi tiết",
                              "suggestedStartTime": "YYYY-MM-DDTHH:mm:ss",
                              "suggestedEndTime": "YYYY-MM-DDTHH:mm:ss",
                              "suggestedLocation": "Địa điểm",
                              "estimatedParticipants": 100,
                              "programItems": [
                                {
                                  "title": "Tên hạng mục",
                                  "description": "Chi tiết",
                                  "startTime": "HH:mm",
                                  "endTime": "HH:mm",
                                  "durationMinutes": 60,
                                  "speaker": "Diễn giả",
                                  "location": "Vị trí cụ thể",
                                  "notes": "Ghi chú kỹ thuật"
                                }
                              ],
                              "requiredResources": [],
                              "teamRoles": [],
                              "confidenceScore": 0.95,
                              "reasoning": "Tại sao đề xuất phương án này"
                            }
                            """,
                    conversationContext, userInput);

            String jsonResponse = callGeminiAPI(prompt);
            return parseEventPlanSuggestion(jsonResponse);

        } catch (Exception e) {
            log.error("Error generating event plan suggestion: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public String analyzeUserIntent(String message) {
        // 0. Skip AI for common greetings/identity questions
        if (getCommonResponse(message) != null) {
            return "GENERAL_QUESTION";
        }

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
            if (result.contains("EVENT_PLANNING"))
                return "EVENT_PLANNING";
            if (result.contains("EVENT_INQUIRY"))
                return "EVENT_INQUIRY";
            if (result.contains("REGISTRATION") || result.contains("ĐĂNG KÝ"))
                return "REGISTRATION_HELP";
            if (result.contains("FEEDBACK") || result.contains("GÓP Ý"))
                return "FEEDBACK";

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
        log.info("Starting AI extraction for text (length: {})", naturalLanguageInput.length());
        try {
            String promptTemplate = """
                    Trích xuất thông tin sự kiện từ văn bản sau và trả về DUY NHẤT định dạng JSON.

                    Văn bản:
                    "{{USER_TEXT}}"

                    Cấu trúc JSON bắt buộc:
                    {
                      "title": "Tên sự kiện rõ ràng",
                      "subject": "Chủ đề chính (Topic)",
                      "purpose": "Mục đích tổ chức chi tiết",
                      "description": "Mô tả chi tiết kế hoạch sự kiện (khoảng 100-200 từ)",
                      "suggestedStartTime": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss) hoặc null",
                      "suggestedEndTime": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss) hoặc null",
                      "suggestedLocation": "Địa điểm cụ thể",
                      "estimatedParticipants": số người dự kiến,
                      "programItems": [
                        {
                          "title": "Tên hạng mục",
                          "description": "Chi tiết hạng mục",
                          "startTime": "HH:mm:ss",
                          "endTime": "HH:mm:ss",
                          "durationMinutes": 30,
                          "speaker": "Người phụ trách/Diễn giả",
                          "location": "Vị trí cụ thể",
                          "notes": "Ghi chú"
                        }
                      ],
                      "interactionSettings": {
                        "enableQA": true/false,
                        "enablePolls": true/false
                      },
                      "hasLuckyDraw": true/false,
                      "confidenceScore": 0.0-1.0
                    }

                     Lưu ý quan trọng:
                     1. Văn bản có thể chứa các tiêu đề hành chính (Cộng hòa xã hội chủ nghĩa, Độc lập tự do...), hãy bỏ qua chúng và tập trung vào nội dung kế hoạch bên dưới.
                     2. Tìm các tiêu đề như "KẾ HOẠCH V/v", "MỤC ĐÍCH", "THỜI GIAN", "NỘI DUNG" để trích xuất.
                     3. Định dạng ngày tháng: Nếu văn bản ghi "16:16 ngày 20/4/2026", hãy chuyển đổi thành "2026-04-20T16:16:00".
                     4. Đối với 'programItems': Trích xuất từng phần (Phần 1, Phần 2...) thành các đối tượng riêng biệt.
                     5. QUAN TRỌNG (Sparse Input Handling): Nếu người dùng chỉ nhập một thông tin ngắn (ví dụ: chỉ tên trường, hoặc chỉ một ý tưởng sơ sài), bạn PHẢI đóng vai chuyên gia để TỰ KIẾN TẠO một kế hoạch hoàn chỉnh (gồm Tên, Mục đích, Mô tả và Lịch trình chi tiết) phù hợp với ngữ cảnh đó. Tuyệt đối không để trống các trường quan trọng.
                     6. Trả về DUY NHẤT JSON.
                     """;

            String prompt = promptTemplate.replace("{{USER_TEXT}}", naturalLanguageInput);

            String jsonResponse = callGeminiAPI(prompt);
            log.info("AI extraction completed. Parsing response...");
            EventPlanSuggestion suggestion = parseEventPlanSuggestion(jsonResponse);

            if (suggestion == null) {
                log.error("Failed to parse AI response as EventPlanSuggestion. Raw response: {}", jsonResponse);
            } else {
                log.info("Successfully extracted details for event: {}", suggestion.getTitle());
            }

            return suggestion;

        } catch (Exception e) {
            log.error("Error during AI extraction process: {}", e.getMessage(), e);
            throw new RuntimeException("AI extraction failed: " + e.getMessage());
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private String buildSystemPrompt(String contextType) {
        String basePrompt = """
                [ROLE]
                Bạn là Trợ lý AI chuyên nghiệp cho hệ thống Quản lý Sự kiện (Event Management Portal).

                [GOAL]
                - Trả lời bằng ngôn ngữ tự nhiên, mạch lạc, dễ hiểu (như một người trợ lý thực thụ).
                - KHÔNG BAO GIỜ hiển thị các nhãn kỹ thuật như "JSON OUTPUT", "ANALYSIS:", "📊 Kết quả...".
                - Hỗ trợ người dùng quản lý, phân tích và tham gia sự kiện một cách thông minh qua hội thoại.

                [RULES]
                1. Ngôn ngữ: Luôn dùng Tiếng Việt tự nhiên, lịch sự, có cảm xúc nhẹ nhàng.
                2. ANTI-HALLUCINATION: Chỉ nói dựa trên dữ liệu thật. Nếu không biết thì nói "Tôi chưa có thông tin này".
                3. Trình bày: Dùng Markdown đẹp mắt, Emoji tinh tế.
                4. KỸ THUẬT NGẦM: Các khối JSON (nếu có) phải nằm im trong [EVENT_CARDS_START] và [EVENT_CARDS_END] ở CUỐI CÙNG. Tuyệt đối không để lộ mã ra ngoài hai thẻ này.
                5. Không nhắc đến các tên gọi lạ như "Zala" hay bất kỳ hệ thống nào khác không thuộc dự án này.
                """;

        String contextSpecific = switch (contextType) {
            case "EVENT_PLANNING" ->
                    """
    
                            [CONTEXT: LẬP KẾ HOẠCH]
                            Bạn đang hỗ trợ Admin xây dựng sự kiện. Hãy tư vấn về ý tưởng, nội dung và các bước tổ chức một cách sáng tạo.
                            """;
            case "EVENT_INQUIRY" ->
                    """
    
                            [CONTEXT: TÌM HIỂU SỰ KIỆN]
                            Bạn đang hỗ trợ người dùng tìm kiếm niềm vui. Hãy giới thiệu sự kiện một cách lôi cuốn, nhấn mạnh vào giá trị mà họ nhận được.
                            """;
            default -> "";
        };

        return basePrompt + contextSpecific;
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

    @Override
    public String getQuickResponse(String message) {
        return getCommonResponse(message);
    }

    private String getCommonResponse(String message) {
        if (message == null || message.trim().isEmpty()) return null;
        
        String msg = message.toLowerCase().trim();
        
        // Greetings
        if (msg.contains("chào") || msg.contains("hello") || msg.contains("hi") || msg.contains("helo") || msg.contains("xin chào")) {
            return "Chào bạn! Tôi là trợ lý AI của hệ thống Sự kiện IUH. Rất vui được hỗ trợ bạn. Hôm nay bạn cần giúp gì nào? 😊";
        }
        
        // Identity
        if (msg.contains("bạn là ai") || msg.contains("tên là gì") || msg.contains("who are you") || msg.contains("là ai") || msg.contains("giới thiệu")) {
            return "Tôi là Trợ lý ảo AI được thiết kế riêng cho Hệ thống Quản lý Sự kiện IUH. Tôi ở đây để giúp bạn khám phá, tham gia và quản lý các hoạt động sự kiện tại trường mình một cách thông minh nhất.";
        }
        
        // Capabilities
        if (msg.contains("làm được gì") || msg.contains("giúp gì") || msg.contains("can you do") || msg.contains("tính năng")) {
            return """
                Tôi có thể giúp bạn rất nhiều việc đấy!
                - 📅 **Tìm kiếm sự kiện:** Gợi ý các hội thảo, cuộc thi, lễ hội phù hợp với bạn.
                - 📝 **Hướng dẫn đăng ký:** Hỗ trợ bạn các bước để nhận vé tham gia.
                - 🏗️ **Lập kế hoạch:** Tư vấn cho Ban tổ chức cách xây dựng chương trình sự kiện chuyên nghiệp.
                - ❓ **Giải đáp thắc mắc:** Trả lời các câu hỏi về địa điểm, thời gian và thông tin liên quan đến IUH Event.
                
                Bạn muốn thử trải nghiệm tính năng nào trước?""";
        }
        
        // How to register
        if (msg.contains("đăng ký") || msg.contains("tham gia")) {
            if (msg.contains("như thế nào") || msg.contains("how") || msg.contains("cách")) {
                return "Rất đơn giản! Bạn chỉ cần vào mục **Sự kiện**, chọn một sự kiện bạn quan tâm và nhấn nút **Đăng ký tham dự**. Sau khi thành công, vé QR Code sẽ xuất hiện trong mục **Sự kiện của tôi** để bạn dùng khi điểm danh.";
            }
        }
        
        // Location
        if (msg.contains("địa chỉ") || msg.contains("ở đâu") || msg.contains("vị trí")) {
            if (msg.contains("trường") || msg.contains("iuh")) {
                return "Cơ sở chính của trường chúng ta nằm tại: **Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh**. Ngoài ra trường còn có các cơ sở tại Quận 12, Thanh Hóa và Quảng Ngãi nữa đấy!";
            }
        }

        return null;
    }

    /**
     * Call AI with Gemini 2.5 Flash as primary and Gemini 3.1 Flash-Lite as fallback.
     * Falls back to DeepSeek if both Gemini models fail.
     */
    private String callGeminiAPI(String prompt) {
        // Only Gemini 2.5 Flash + 3.1 Flash-Lite (NO 1.5/1.0)
        String[] models = {"gemini-2.5-flash", "gemini-3.1-flash-lite"};

        for (String model : models) {
            try {
                // Try v1beta first (newer models live here), then v1
                String result = callGeminiDirect(prompt, model, "v1beta");
                if (result == null) {
                    result = callGeminiDirect(prompt, model, "v1");
                }
                
                if (result != null) {
                    log.info("AI response successful from model: {}", model);
                    return result;
                }
            } catch (GeminiQuotaException e) {
                log.warn("Quota exceeded for model: {}, trying next...", model);
                continue;
            } catch (Exception e) {
                log.warn("Error with model {}: {}", model, e.getMessage());
            }
        }

        // 3. Fallback to DeepSeek
        try {
            if (chatClient != null) {
                log.info("Using DeepSeek as tertiary fallback");
                return chatClient.prompt()
                        .user(prompt)
                        .call()
                        .content();
            }
        } catch (Exception e) {
            log.error("All AI fallbacks failed: {}", e.getMessage());
        }

        return "ERROR_AI_OVERLOADED";
    }

    private String callGeminiDirect(String prompt, String modelName, String apiVersion) throws GeminiQuotaException {
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
                int code = response.code();
                if (code == 429 || code == 503) {
                    throw new GeminiQuotaException("Gemini quota/rate limit: HTTP " + code);
                }
                if (code == 404) {
                    log.debug("Model {} not found on endpoint {}", modelName, apiVersion);
                    return null;
                }
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No body";
                    log.warn("{} ({}) returned HTTP {} - Error: {}", modelName, apiVersion, code, errorBody);
                    return null;
                }
                String body = response.body().string();
                JsonNode root = objectMapper.readTree(body);
                String text = root.at("/candidates/0/content/parts/0/text").asText(null);
                return (text != null && !text.isBlank()) ? text : null;
            }
        } catch (GeminiQuotaException e) {
            throw e;
        } catch (Exception e) {
            log.error("{} ({}) call exception: {}", modelName, apiVersion, e.getMessage());
            return null;
        }
    }

    /** Sentinel exception for Gemini quota/rate-limit errors */
    private static class GeminiQuotaException extends Exception {
        GeminiQuotaException(String msg) { super(msg); }
    }

    private EventPlanSuggestion parseEventPlanSuggestion(String jsonResponse) {
        try {
            if (jsonResponse == null || jsonResponse.equals("ERROR_AI_OVERLOADED"))
                return null;

            // More robust JSON extraction: find the first '{' and the last '}'
            int start = jsonResponse.indexOf('{');
            int end = jsonResponse.lastIndexOf('}');

            if (start == -1) {
                log.error("No valid JSON object found in response: {}", jsonResponse);
                return null;
            }

            String cleanJson;
            if (end <= start) {
                // Attempt to repair truncated JSON by adding closing braces
                log.warn("Detected truncated JSON, attempting repair...");
                cleanJson = jsonResponse.substring(start) + "\n}\n}";
            } else {
                cleanJson = jsonResponse.substring(start, end + 1);
            }

            log.debug("Attempting to parse JSON: {}", cleanJson);
            JsonNode root;
            try {
                root = objectMapper.readTree(cleanJson);
            } catch (Exception e) {
                log.warn("Standard JSON parsing failed, trying simple repair: {}", e.getMessage());
                // Simple repair for missing closing quotes/braces
                if (!cleanJson.endsWith("}"))
                    cleanJson += "\"} }";
                try {
                    root = objectMapper.readTree(cleanJson);
                } catch (Exception e2) {
                    log.error("JSON parsing completely failed after repair attempts");
                    return null;
                }
            }

            EventPlanSuggestion suggestion = EventPlanSuggestion.builder()
                    .title(root.path("title").asText(null))
                    .subject(root.path("subject").asText(root.path("eventTopic").asText(null)))
                    .purpose(root.path("purpose").asText(root.path("eventPurpose").asText(null)))
                    .description(root.path("description").asText(null))
                    .suggestedLocation(root.path("suggestedLocation").asText(root.path("location").asText(null)))
                    .estimatedParticipants(
                            root.path("estimatedParticipants").asInt(root.path("maxParticipants").asInt(0)))
                    .confidenceScore(root.path("confidenceScore").asDouble(0.0))
                    .reasoning(root.path("reasoning").asText(null))
                    .additionalData(new HashMap<>())
                    .build();

            // Flexible datetime parsing
            if (root.has("suggestedStartTime") && !root.path("suggestedStartTime").isNull()) {
                suggestion.setSuggestedStartTime(parseFlexibleDateTime(root.path("suggestedStartTime").asText()));
            }
            if (root.has("suggestedEndTime") && !root.path("suggestedEndTime").isNull()) {
                suggestion.setSuggestedEndTime(parseFlexibleDateTime(root.path("suggestedEndTime").asText()));
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

                    try {
                        if (item.has("startTime") && !item.path("startTime").isNull()
                                && !item.path("startTime").asText().isEmpty()) {
                            programItem.setStartTime(LocalTime.parse(item.path("startTime").asText()));
                        }
                        if (item.has("endTime") && !item.path("endTime").isNull()
                                && !item.path("endTime").asText().isEmpty()) {
                            programItem.setEndTime(LocalTime.parse(item.path("endTime").asText()));
                        }
                    } catch (Exception e) {
                        log.warn("Could not parse time for session: {}", item.path("title").asText());
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

            // Parse interaction settings into additionalData
            if (root.has("interactionSettings")) {
                Map<String, Object> additionalData = suggestion.getAdditionalData();
                if (additionalData == null)
                    additionalData = new HashMap<>();

                JsonNode settings = root.get("interactionSettings");
                Map<String, Object> interactionMap = new HashMap<>();
                if (settings.has("enableQA"))
                    interactionMap.put("enableQA", settings.get("enableQA").asBoolean());
                if (settings.has("enablePolls"))
                    interactionMap.put("enablePolls", settings.get("enablePolls").asBoolean());

                additionalData.put("interactionSettings", interactionMap);
                suggestion.setAdditionalData(additionalData);
            }

            if (root.has("hasLuckyDraw")) {
                Map<String, Object> additionalData = suggestion.getAdditionalData();
                if (additionalData == null)
                    additionalData = new HashMap<>();
                additionalData.put("hasLuckyDraw", root.get("hasLuckyDraw").asBoolean());
                suggestion.setAdditionalData(additionalData);
            }

            return suggestion;

        } catch (Exception e) {
            log.error("Error parsing event plan suggestion: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public EventPlanSuggestion generatePlanFromTemplate(String templateName, String templateDescription,
                                                         String userContext) {
        String prompt = String.format("""
                Bạn là chuyên gia lập kế hoạch sự kiện chuyên nghiệp.
                Hãy tạo một bản kế hoạch chi tiết dựa trên mẫu sau:
                - Tên mẫu: %s
                - Mô tả mẫu: %s
                - Yêu cầu thêm của người dùng: %s

                YÊU CẦU ĐẦU RA (JSON format):
                {
                  "title": "Tiêu đề sự kiện gợi ý",
                  "subject": "Chủ đề chính",
                  "purpose": "Mục đích chi tiết",
                  "description": "Mô tả chi tiết kế hoạch (khoảng 200-300 từ)",
                  "suggestedStartTime": "YYYY-MM-DDTHH:mm:ss",
                  "suggestedEndTime": "YYYY-MM-DDTHH:mm:ss",
                  "suggestedLocation": "Địa điểm gợi ý",
                  "estimatedParticipants": 100,
                  "programItems": [
                    {
                      "title": "Tên hạng mục",
                      "description": "Chi tiết hạng mục",
                      "startTime": "HH:mm:ss",
                      "endTime": "HH:mm:ss",
                      "durationMinutes": 30,
                      "speaker": "Người phụ trách/Diễn giả",
                      "location": "Vị trí cụ thể",
                      "notes": "Ghi chú"
                    }
                  ],
                  "requiredResources": ["Tài nguyên 1", "Tài nguyên 2"],
                  "teamRoles": ["Vai trò 1", "Vai trò 2"],
                  "confidenceScore": 0.95,
                  "reasoning": "Tại sao lại đề xuất như vậy?"
                }
                Lưu ý: Chỉ trả về JSON, không giải thích gì thêm.
                """, templateName, templateDescription, userContext != null ? userContext : "Không có");

        try {
            String response = callGeminiAPI(prompt);
            if ("ERROR_AI_OVERLOADED".equals(response))
                return null;
            return parseEventPlanSuggestion(response);
        } catch (Exception e) {
            log.error("Error generating plan from template: {}", e.getMessage());
            return null;
        }
    }

    private LocalDateTime parseFlexibleDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty())
            return null;
        String cleanStr = dateTimeStr.trim().replace(" ", "T");
        try {
            // Try ISO format (YYYY-MM-DDTHH:mm:ss)
            return LocalDateTime.parse(cleanStr);
        } catch (Exception e) {
            try {
                // Try DD/MM/YYYY HH:mm:ss or DD/MM/YYYYTHH:mm:ss
                String[] parts = cleanStr.split("T");
                String datePart = parts[0];
                String timePart = parts.length > 1 ? parts[1] : "00:00:00";

                if (datePart.contains("/")) {
                    String[] dateComp = datePart.split("/");
                    if (dateComp.length == 3) {
                        String day = dateComp[0].length() == 1 ? "0" + dateComp[0] : dateComp[0];
                        String month = dateComp[1].length() == 1 ? "0" + dateComp[1] : dateComp[1];
                        String year = dateComp[2];
                        return LocalDateTime.parse(year + "-" + month + "-" + day + "T" + timePart);
                    }
                }
                return LocalDateTime.parse(cleanStr + "T00:00:00");
            } catch (Exception e2) {
                log.warn("Could not parse datetime string: {}", dateTimeStr);
                return null;
            }
        }
    }

    @Override
    public String analyzeEventStatistics(String eventDataJson) {
        log.info("Requesting AI to analyze event statistics");
        try {
            String prompt = String.format("""
                [ROLE]
                Bạn là Chuyên gia Phân tích Dữ liệu Sự kiện (Event Data Analyst).
                
                [INPUT DATA - JSON]
                %s
                
                [GOAL]
                Dựa trên dữ liệu thực tế của sự kiện, hãy đưa ra các đánh giá thông minh, trung thực và có giá trị chuyên môn.
                
                [OUTPUT FORMAT - JSON ONLY]
                {
                  "summary": "Đánh giá tổng quát (khoảng 2-3 câu, nêu bật hiệu quả)",
                  "recommendation": "Lời khuyên hành động (ví dụ: Mở rộng quy mô, Tăng cường truyền thông...)",
                  "highlight": "Điểm sáng nhất của sự kiện (ví dụ: Tỷ lệ check-in cao, Phản hồi tích cực...)",
                  "lessonsLearned": "Phân tích sâu và bài học rút ra (đoạn văn dài hơn, mang tính chuyên sâu)"
                }
                
                Lưu ý: Chỉ trả về JSON, dùng ngôn ngữ Tiếng Việt chuyên nghiệp, lịch sự.
                """, eventDataJson);

            return callGeminiAPI(prompt);
        } catch (Exception e) {
            log.error("Error analyzing event statistics: {}", e.getMessage());
            return "ERROR_AI_OVERLOADED";
        }
    }
}