package com.eventservice.service.impl;

import com.eventservice.dto.EventPlanSuggestion;
import com.eventservice.dto.ProgramItemSuggestion;
import com.eventservice.entity.social.ChatMessage;
import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.service.GeminiChatService;
import com.eventservice.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatServiceImpl implements GeminiChatService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final AppProperties appProperties;

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
                              "suggestedStartTime": "YYYY-MM-DDTHH:mm:ss (mặc định giờ là 08:00:00 nếu người dùng chỉ cung cấp ngày)",
                              "suggestedEndTime": "YYYY-MM-DDTHH:mm:ss (mặc định giờ là 11:30:00 nếu người dùng chỉ cung cấp ngày)",
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
            // Kiểm tra nếu đây là một prompt gợi ý trực tiếp từ Frontend
            boolean isDirectPrompt = naturalLanguageInput.contains("gợi ý") || 
                                   naturalLanguageInput.contains("tiêu đề") || 
                                   naturalLanguageInput.length() < 500;

            if (isDirectPrompt) {
                log.info("Detected direct suggestion prompt, bypassing DOCX template");
                String response = callGeminiAPI(naturalLanguageInput);
                // Trả về một object tối giản chứa nội dung gợi ý trong phần reasoning hoặc description
                return EventPlanSuggestion.builder()
                        .title("AI Suggestion")
                        .description(response) // Frontend sẽ đọc từ đây
                        .build();
            }

            String promptTemplate = """
                    Trích xuất thông tin sự kiện từ văn bản sau và trả về DUY NHẤT định dạng JSON.

                    Văn bản:
                    "{{USER_TEXT}}"

                    Cấu trúc JSON bắt buộc:
                    {
                      "title": "Tên sự kiện rõ ràng",
                      "subject": "Chủ đề chính",
                      "suggestedStartTime": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)",
                      "suggestedEndTime": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)",
                      "registrationDeadline": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)",
                      "suggestedLocation": "Địa điểm cụ thể",
                      "estimatedParticipants": số người dự kiến,
                      "programItems": [
                        {
                          "title": "Tên hạng mục",
                          "description": "Chi tiết hạng mục",
                          "startTime": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)",
                          "endTime": "ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)",
                          "durationMinutes": 30,
                          "speaker": "Người phụ trách/Diễn giả",
                          "location": "Vị trí cụ thể",
                          "notes": "Ghi chú"
                        }
                      ],
                      "interactionSettings": {
                        "enableQA": true,
                        "enablePolls": true
                      },
                      "hasLuckyDraw": false,
                      "confidenceScore": 0.0
                    }

                    Lưu ý quan trọng:
                    1. TUYỆT ĐỐI KHÔNG lấy tên trường, tên bộ hoặc tiêu ngữ làm "title".
                    2. TIÊU ĐỀ SỰ KIỆN (title) thường nằm ở dòng có chữ "KẾ HOẠCH" hoặc ngay sau cụm từ "V/v: ...".
                    3. TỰ ĐỘNG PHÂN BỔ THỜI GIAN: Nếu "NỘI DUNG CHƯƠNG TRÌNH" không có giờ cụ thể, hãy tự chia tổng thời lượng sự kiện cho các programItems.
                    4. HẠN ĐĂNG KÝ (registrationDeadline): Tìm kiếm ngày hạn chót đăng ký trong văn bản. Nếu không thấy, hãy mặc định là 1 ngày trước suggestedStartTime.
                    5. ĐỊNH DẠNG THỜI GIAN: Tất cả startTime/endTime/registrationDeadline PHẢI là ISO 8601 đầy đủ (YYYY-MM-DDTHH:mm:ss).
                    6. Tìm các mục "I. MỤC ĐÍCH", "II. THỜI GIAN, ĐỊA ĐIỂM", "III. NỘI DUNG CHƯƠNG TRÌNH" để trích xuất dữ liệu.
                    7. Trả về DUY NHẤT định dạng JSON, không giải thích.
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

    private String callGeminiAPI(String prompt) {
        try {
            log.info("Calling Gemini AI API...");
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.warn("Gemini AI service call failed or overloaded: {}. Switching to local AI fallback...", e.getMessage());
            return callLocalAI(prompt);
        }
    }

    private String callLocalAI(String prompt) {
        try {
            // Sử dụng URL từ cấu hình (AppProperties)
            String localUrl = appProperties.getAi().getLocalUrl();
            if (localUrl == null || localUrl.isEmpty()) {
                localUrl = "http://host.docker.internal:3000/chat";
            }
            
            // Đảm bảo có path /chat nếu chưa có
            if (!localUrl.endsWith("/chat")) {
                localUrl = localUrl.endsWith("/") ? localUrl + "chat" : localUrl + "/chat";
            }

            log.info("Calling Local AI Fallback at: {}", localUrl);
            
            Map<String, String> request = new HashMap<>();
            request.put("prompt", prompt);

            Map<String, Object> response = restTemplate.postForObject(
                    localUrl,
                    request,
                    Map.class
            );

            if (response != null && response.containsKey("reply")) {
                log.info("Local AI Fallback successful.");
                return (String) response.get("reply");
            }
            
            return "Dịch vụ AI hiện đang bảo trì. Vui lòng thử lại sau.";
        } catch (Exception e) {
            log.error("Local AI Fallback also failed: {}", e.getMessage());
            return "Hệ thống AI (cả Gemini và Local) hiện không khả dụng. Vui lòng kiểm tra lại kết nối.";
        }
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
                    .estimatedParticipants(root.path("estimatedParticipants").asInt(root.path("maxParticipants").asInt(0)))
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
            if (root.has("registrationDeadline") && !root.path("registrationDeadline").isNull()) {
                suggestion.setRegistrationDeadline(parseFlexibleDateTime(root.path("registrationDeadline").asText()));
            }

            // Parse program items
            if (root.has("programItems")) {
                List<ProgramItemSuggestion> items = new ArrayList<>();
                JsonNode programItemsNode = root.path("programItems");
                if (programItemsNode.isArray()) {
                    for (JsonNode item : programItemsNode) {
                        try {
                            String startTimeStr = item.path("startTime").asText(null);
                            String endTimeStr = item.path("endTime").asText(null);
                            
                            ProgramItemSuggestion programItem = ProgramItemSuggestion.builder()
                                    .title(item.path("title").asText("Không tên"))
                                    .description(item.path("description").asText(""))
                                    .speaker(item.path("speaker").asText(null))
                                    .location(item.path("location").asText(null))
                                    .notes(item.path("notes").asText(null))
                                    .startTime(parseFlexibleDateTime(startTimeStr))
                                    .endTime(parseFlexibleDateTime(endTimeStr))
                                    .durationMinutes(item.path("durationMinutes").asInt(30))
                                    .build();
                            
                            items.add(programItem);
                        } catch (Exception e) {
                            log.warn("Error parsing program item: {}", e.getMessage());
                        }
                    }
                }
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

    @Override
    public String generateMediaPost(String eventDetails) {
        try {
            String prompt = String.format("""
                [ROLE]
                Bạn là một chuyên gia truyền thông sự kiện xuất sắc.
                
                [TASK]
                Dựa trên thông tin sự kiện dưới đây, hãy viết một bài đăng truyền thông hấp dẫn để thu hút người tham gia.
                
                Thông tin sự kiện:
                %s
                
                [OUTPUT FORMAT - JSON ONLY]
                {
                  "title": "Tiêu đề bài đăng thật thu hút (khoảng 5-10 từ)",
                  "content": "Nội dung bài đăng gồm 3 phần: Mở đầu gây chú ý, Thông tin cốt lõi, và Lời kêu gọi hành động (Call to action). Sử dụng emoji phù hợp."
                }
                
                Lưu ý: Chỉ trả về JSON hợp lệ.
                """, eventDetails);

            String response = callGeminiAPI(prompt);
            
            if (response == null || response.equals("ERROR_AI_OVERLOADED")) {
                return "ERROR_AI_OVERLOADED";
            }

            // Clean JSON response (remove markdown markers if present)
            int start = response.indexOf('{');
            int end = response.lastIndexOf('}');
            if (start != -1 && end != -1 && end >= start) {
                return response.substring(start, end + 1);
            }
            
            return response;
        } catch (Exception e) {
            log.error("CRITICAL ERROR generating media post: {}", e.getMessage());
            return "ERROR_AI_OVERLOADED";
        }
    }
}