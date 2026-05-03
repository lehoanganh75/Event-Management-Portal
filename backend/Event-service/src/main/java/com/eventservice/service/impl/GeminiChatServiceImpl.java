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

import java.util.Map;
import java.util.HashMap;
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

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String geminiApiUrl;

    private final ObjectMapper objectMapper;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
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
                    "temperature": 0.4,
                    "maxOutputTokens": 4096
                  }
                }
                """, objectMapper.writeValueAsString(prompt));

        // Danh sách các model dự phòng theo thứ tự ưu tiên (Dùng các model thực tế đang
        // tồn tại)
        List<String> modelsToTry = List.of(
                "gemini-2.5-flash",
                "gemini-3.1-flash-lite-preview",
                "gemini-2.0-flash",
                "gemini-1.5-pro");

        // Lấy tên model hiện tại từ URL (để biết nên bắt đầu từ đâu nếu URL đã chỉ định
        // model khác)
        String currentModelInConfig = "gemini-2.5-flash";
        if (geminiApiUrl.contains("models/")) {
            currentModelInConfig = geminiApiUrl.substring(geminiApiUrl.indexOf("models/") + 7,
                    geminiApiUrl.indexOf(":generateContent"));
        }

        // Tạo bản copy danh sách và đưa model cấu hình lên đầu nếu chưa có
        List<String> effectiveModels = new ArrayList<>(modelsToTry);
        if (!effectiveModels.contains(currentModelInConfig)) {
            effectiveModels.add(0, currentModelInConfig);
        }

        for (String modelName : effectiveModels) {
            String targetUrl = String
                    .format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", modelName);

            // Tăng số lần thử lại lên 5 lần cho mỗi model (Chờ lâu cũng được nhưng phải ra
            // kết quả)
            for (int attempt = 0; attempt <= 4; attempt++) {
                Request request = new Request.Builder()
                        .url(targetUrl + "?key=" + geminiApiKey)
                        .post(RequestBody.create(requestBody, MediaType.parse("application/json")))
                        .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    int code = response.code();
                    String responseBody = response.body() != null ? response.body().string() : "";

                    // TRƯỜNG HỢP 1: Thành công
                    if (response.isSuccessful()) {
                        JsonNode jsonNode = objectMapper.readTree(responseBody);
                        JsonNode textNode = jsonNode.at("/candidates/0/content/parts/0/text");

                        if (textNode.isMissingNode()) {
                            String finishReason = jsonNode.at("/candidates/0/finishReason").asText("");
                            if ("SAFETY".equals(finishReason)) {
                                return "🛡️ Nội dung này đã bị hệ thống an toàn chặn. Vui lòng đặt câu hỏi khác.";
                            }
                            log.warn("Model {} returned empty content. Moving to next model.", modelName);
                            break;
                        }
                        return textNode.asText().trim();
                    }

                    // TRƯỜNG HỢP 2: Hết Quota (429) hoặc Model không tồn tại (404)
                    if (code == 429 || code == 404) {
                        log.warn("Model {} reached limit or not found. Code: {}. Body: {}. Switching model...",
                                modelName, code, responseBody);
                        break;
                    }

                    // TRƯỜNG HỢP 3: Lỗi Server (5xx) hoặc quá tải tạm thời
                    if (code >= 500) {
                        log.warn("Model {} error {}. Body: {}. Attempt {}/5.", modelName, code, responseBody,
                                attempt + 1);
                        if (code == 503 && attempt >= 1) {
                            log.warn("Model {} is heavily overloaded (503). Switching to next model immediately.",
                                    modelName);
                            break; // Thoát vòng lặp retry để thử model tiếp theo
                        }
                        Thread.sleep(2000 * (attempt + 1));
                        continue;
                    }

                    // Các lỗi khác (400, v.v.)
                    log.error("Model {} error {}. Body: {}. Trying next model.", modelName, code, responseBody);
                    break;

                } catch (Exception e) {
                    log.error("Network error with model {} (Attempt {}): {}", modelName, attempt, e.getMessage());
                    Thread.sleep(2000);
                    if (attempt == 4)
                        break;
                }
            }
        }

        // Nếu tất cả các model và các lượt thử đều thất bại
        return "ERROR_AI_OVERLOADED";
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

    // ==================== END ====================
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
            String promptTemplate = """
                [ROLE]
                Bạn là Chuyên gia Phân tích Dữ liệu Sự kiện (Event Data Analyst).
                
                [INPUT DATA - JSON]
                {{EVENT_DATA}}
                
                [GOAL]
                Dựa trên dữ liệu thực tế của sự kiện, hãy đưa ra các đánh giá thông minh, trung thực và có giá trị chuyên môn.
                
                [OUTPUT FORMAT - JSON ONLY]
                {
                  "successLevel": "Đánh giá mức độ thành công chung (Ví dụ: Xuất sắc, Khá tốt, Cần cải thiện, ...)",
                  "summary": "Đánh giá tổng quát (khoảng 2-3 câu, nêu bật hiệu quả)",
                  "recommendation": "Lời khuyên hành động (ví dụ: Mở rộng quy mô, Tăng cường truyền thông...)",
                  "highlight": "Điểm sáng nhất của sự kiện (ví dụ: Tỷ lệ check-in cao, Phản hồi tích cực...)",
                  "lessonsLearned": "Phân tích sâu và bài học rút ra (đoạn văn dài hơn, mang tính chuyên sâu)"
                }
                
                Lưu ý: Chỉ trả về JSON, dùng ngôn ngữ Tiếng Việt chuyên nghiệp, lịch sự.
                """;
            String prompt = promptTemplate.replace("{{EVENT_DATA}}", eventDataJson);

            String result = callGeminiAPI(prompt);
            if ("ERROR_AI_OVERLOADED".equals(result)) {
                log.warn("AI API key invalid or overloaded. Using smart programmatic fallback.");
                return generateFallbackStatistics(eventDataJson);
            }
            return result;
        } catch (Exception e) {
            log.error("Error analyzing event statistics: {}", e.getMessage());
            return generateFallbackStatistics(eventDataJson);
        }
    }

    private String generateFallbackStatistics(String eventDataJson) {
        try {
            JsonNode data = objectMapper.readTree(eventDataJson);
            int totalReg = data.path("totalRegistered").asInt(0);
            int totalCheckIn = data.path("totalCheckedIn").asInt(0);
            
            String successLevel = "Chưa xác định";
            String summary = "Sự kiện bước đầu ghi nhận các chỉ số tương tác khá tốt.";
            String recommendation = "Tiếp tục duy trì hệ thống đăng ký và nhắc hẹn hiện tại.";
            String highlight = "Dữ liệu được cập nhật tự động.";
            String lessonsLearned = "Để có phân tích dự báo sâu hơn, hệ thống AI Insight đang trong trạng thái bảo trì và sẽ cung cấp dữ liệu chi tiết sau.";
            
            if (totalReg > 0 && totalCheckIn > 0) {
                double rate = (double) totalCheckIn / totalReg * 100;
                if (rate >= 80) {
                    successLevel = "Xuất sắc";
                    summary = String.format("Sự kiện đạt hiệu quả xuất sắc với %d lượt đăng ký và %d lượt check-in thực tế.", totalReg, totalCheckIn);
                    recommendation = "Nghiên cứu mở rộng quy mô tổ chức cho các sự kiện có chủ đề tương tự trong tương lai.";
                    highlight = String.format("Tỷ lệ tham gia cao đáng kể (%.1f%%).", rate);
                    lessonsLearned = "Sự quan tâm của khán giả rất lớn, cho thấy chủ đề sự kiện đáp ứng đúng nhu cầu thực tế và công tác nhắc hẹn qua Email/SMS hoạt động hoàn hảo.";
                } else if (rate >= 50) {
                    successLevel = "Khá tốt";
                    summary = String.format("Sự kiện đạt mức độ tương tác khá với %d lượt tham gia trên tổng số %d đăng ký.", totalCheckIn, totalReg);
                    recommendation = "Tăng cường nhắc hẹn tự động sát giờ sự kiện để tối đa hóa tỷ lệ tham gia.";
                    highlight = "Quá trình đăng ký diễn ra rất sôi nổi.";
                    lessonsLearned = "Có sự rơi rụng nhất định giữa lúc đăng ký và lúc tham gia thực tế. Cần phân tích lại khung giờ tổ chức xem có phù hợp với đối tượng mục tiêu hay không.";
                } else {
                    successLevel = "Cần cải thiện";
                    summary = String.format("Tỷ lệ tham gia thực tế khá thấp (%d/%d).", totalCheckIn, totalReg);
                    recommendation = "Kiểm tra lại hệ thống quét mã QR hoặc quy trình đón tiếp để đảm bảo không bỏ sót người tham dự.";
                    highlight = "Hệ thống ghi nhận đầy đủ lượng người đăng ký ban đầu.";
                    lessonsLearned = "Cần cải thiện mạnh mẽ chiến dịch truyền thông trước sự kiện và rà soát lại các yếu tố gây trở ngại cho người tham gia (thời tiết, địa điểm, thời gian).";
                }
            }
            
            // Format as valid JSON
            return String.format("""
            {
              "successLevel": "%s",
              "summary": "%s",
              "recommendation": "%s",
              "highlight": "%s",
              "lessonsLearned": "%s"
            }
            """, successLevel, summary, recommendation, highlight, lessonsLearned);
        } catch (Exception e) {
            log.error("Fallback generation failed: {}", e.getMessage());
            return """
            {
              "successLevel": "Chưa rõ",
              "summary": "Đã ghi nhận dữ liệu thống kê sự kiện thành công.",
              "recommendation": "Tiếp tục thu thập dữ liệu đăng ký và check-in.",
              "highlight": "Hệ thống đang theo dõi tiến độ sự kiện.",
              "lessonsLearned": "Hệ thống AI phân tích đang bảo trì, vui lòng thử lại sau ít phút."
            }
            """;
        }
    }
}