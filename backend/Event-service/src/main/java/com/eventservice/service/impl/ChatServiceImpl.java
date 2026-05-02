package com.eventservice.service.impl;

import com.eventservice.dto.core.request.*;
import com.eventservice.dto.core.response.*;
import com.eventservice.dto.registration.request.*;
import com.eventservice.dto.registration.response.*;
import com.eventservice.dto.social.request.*;
import com.eventservice.dto.social.response.*;
import com.eventservice.dto.plan.request.*;
import com.eventservice.dto.plan.response.*;
import com.eventservice.dto.user.*;
import com.eventservice.dto.engagement.*;
import com.eventservice.entity.social.ChatMessage;
import com.eventservice.entity.social.ChatSession;
import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.entity.enums.ChatMessageType;
import com.eventservice.entity.enums.ChatSessionStatus;
import com.eventservice.repository.ChatMessageRepository;
import com.eventservice.repository.ChatSessionRepository;
import com.eventservice.entity.mongodb.EventVector;
import com.eventservice.repository.EventRegistrationRepository;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.mongodb.EventVectorRepository;
import com.eventservice.service.ChatService;
import com.eventservice.service.EventEmbeddingService;
import com.eventservice.service.GeminiChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final EventRepository eventRepository;
    private final EventVectorRepository eventVectorRepository;
    private final GeminiChatService geminiChatService;
    private final EventEmbeddingService eventEmbeddingService;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final GeminiAIService geminiAIService;
    private final TemplateRecommendationService templateRecommendationService;
    private final EmbeddingModel embeddingModel;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ChatSessionResponse createOrResumeSession(ChatSessionRequest request, String userId) {
        ChatSession session;

        // Try to resume existing session
        if (request.getSessionId() != null) {
            session = chatSessionRepository.findBySessionId(request.getSessionId())
                    .orElse(null);

            if (session != null && session.getStatus() == ChatSessionStatus.ACTIVE) {
                log.info("Resuming chat session: {}", request.getSessionId());
                return mapToResponse(session);
            }
        }

        // Create new session
        session = ChatSession.builder()
                .sessionId(UUID.randomUUID().toString())
                .userId(userId) // null for guest
                .guestName(request.getGuestName())
                .guestEmail(request.getGuestEmail())
                .status(ChatSessionStatus.ACTIVE)
                .contextType(request.getContextType())
                .contextId(request.getContextId())
                .build();

        session = chatSessionRepository.save(session);
        log.info("Created new chat session: {} for user: {}", session.getSessionId(),
                userId != null ? userId : "guest");

        // Send welcome message
        sendWelcomeMessage(session);

        return mapToResponse(session);
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, String userId) {
        // Get session or create a new one if not found (fixes 500 error when session
        // expires/DB reset)
        ChatSession session = chatSessionRepository.findBySessionId(request.getSessionId())
                .orElseGet(() -> {
                    log.info("Session {} not found, creating a fallback session", request.getSessionId());
                    ChatSession newSession = ChatSession.builder()
                            .sessionId(UUID.randomUUID().toString())
                            .userId(userId)
                            .status(ChatSessionStatus.ACTIVE)
                            .contextType("GENERAL_INQUIRY")
                            .build();
                    return chatSessionRepository.save(newSession);
                });

        // Validate session ownership (allow guest access if session userId is null)
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
            // If mismatch, we create a new session for this user instead of throwing error
            log.warn("Session userId mismatch. Creating new session for user {}", userId);
            session = ChatSession.builder()
                    .sessionId(UUID.randomUUID().toString())
                    .userId(userId)
                    .status(ChatSessionStatus.ACTIVE)
                    .contextType("GENERAL_INQUIRY")
                    .build();
            session = chatSessionRepository.save(session);
        }

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .chatSession(session)
                .role(ChatMessageRole.USER)
                .type(ChatMessageType.valueOf(request.getMessageType() != null ? request.getMessageType() : "TEXT"))
                .content(request.getContent())
                .build();

        userMessage = chatMessageRepository.save(userMessage);

        // Ensure we update session ID in response if it's a new one
        String currentSessionId = session.getSessionId();

        // Analyze intent
        String intent = geminiChatService.analyzeUserIntent(request.getContent());
        log.info("User intent: {}", intent);

        // Update context if needed
        if ("EVENT_PLANNING".equals(intent) && session.getContextType() == null) {
            session.setContextType("EVENT_PLANNING");
            chatSessionRepository.save(session);
        }

        // Get conversation history (Limit to last 20 for context efficiency)
        List<ChatMessage> fullHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(request.getSessionId());
        List<ChatMessage> history = fullHistory.size() > 20 
                ? fullHistory.subList(fullHistory.size() - 20, fullHistory.size()) 
                : fullHistory;
        
        // --- SMART RAG INTEGRATION (VECTOR SEARCH) ---
        Set<com.eventservice.entity.core.Event> contextEventsSet = new LinkedHashSet<>();
        String userQuery = request.getContent();
        
        try {
            log.info("Performing Vector Search for query: {}", userQuery);
            
            if (embeddingModel != null) {
                // 1. Tạo embedding cho câu hỏi
                List<Double> queryEmbedding = embeddingModel.embed(userQuery);

                // 2. Lấy tất cả vector và tìm kiếm
                List<EventVector> allVectors = eventVectorRepository.findAll();
                List<String> topEventIds = allVectors.stream()
                        .map(v -> new AbstractMap.SimpleEntry<>(v.getId(), calculateCosineSimilarity(queryEmbedding, v.getEmbedding())))
                        .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                        .filter(e -> e.getValue() > 0.6)
                        .limit(5)
                        .map(AbstractMap.SimpleEntry::getKey)
                        .collect(Collectors.toList());

                if (!topEventIds.isEmpty()) {
                    contextEventsSet.addAll(eventRepository.findAllById(topEventIds));
                }
            }
        } catch (Exception e) {
            log.error("Vector Search failed: {}", e.getMessage());
        }

        // Luôn bổ sung tìm kiếm theo từ khóa
        String keyword = extractSearchKeyword(userQuery);
        if (keyword != null && !keyword.isBlank()) {
            contextEventsSet.addAll(eventRepository.searchByKeyword(keyword));
        }

        // QUAN TRỌNG: Luôn lấy thêm 5 sự kiện mới nhất/nổi bật nhất để AI có dữ liệu so sánh
        List<com.eventservice.entity.core.Event> latestEvents = eventRepository.findByIsDeletedFalseOrderByStartTimeDesc()
                .stream().limit(5).collect(Collectors.toList());
        contextEventsSet.addAll(latestEvents);
        
        List<com.eventservice.entity.core.Event> finalContextEvents = new ArrayList<>(contextEventsSet);
        String eventContext = buildEventContext(finalContextEvents);

        String enhancedUserMessage = request.getContent();
        
        // 1. INJECT MEMORY + CONTEXT
        String userInfo = String.format("""
            [THÔNG TIN NGƯỜI DÙNG HIỆN TẠI]
            - Tên: %s
            - Vai trò: %s
            - Ngữ cảnh: %s
            
            """, "Người dùng", session.getContextType(), session.getContextType());
        
        if (!eventContext.isEmpty()) {
            enhancedUserMessage = userInfo + String.format("""
                [DỮ LIỆU SỰ KIỆN HỆ THỐNG - RAG]
                %s
                [KẾT THÚC DỮ LIỆU]
                
                Dựa trên dữ liệu trên, hãy trả lời câu hỏi của người dùng: "%s"
                
                YÊU CẦU:
                1. Trả lời bằng ngôn ngữ tự nhiên, thân thiện.
                2. Nếu có sự kiện phù hợp, hãy liệt kê thông tin bằng văn bản TRƯỚC.
                3. Chỉ cung cấp dữ liệu kỹ thuật ở CUỐI CÙNG trong khối [EVENT_CARDS_START] ... [EVENT_CARDS_END]. 
                4. CỰC KỲ QUAN TRỌNG: Khi tạo JSON cho thẻ sự kiện, bạn PHẢI sử dụng đúng "Slug" và "ID" được cung cấp trong dữ liệu hệ thống ở trên. Tuyệt đối không tự bịa ra slug.
                """, eventContext, request.getContent());
        } else {
            enhancedUserMessage = userInfo + request.getContent();
        }

        // Generate AI response
        String aiResponse = geminiChatService.generateChatResponse(
                enhancedUserMessage,
                history,
                session.getContextType()
        );

        
        // Ghi lại log để theo dõi
        if (enhancedUserMessage.length() > 250) {
            log.info("Handled a long message via unified AI response to avoid double answers.");
        }

        // Fallback: Nếu AI trả về lỗi hoặc mã quá tải -> Dùng bộ phản hồi từ DB
        if (aiResponse == null || aiResponse.isBlank() || aiResponse.contains("⚠️") || aiResponse.contains("gián đoạn")
                || aiResponse.contains("quá tải") || aiResponse.contains("quota") || aiResponse.contains("503")
                || aiResponse.contains("unavailable") || aiResponse.equals("ERROR_AI_OVERLOADED")) {
            
            log.warn("AI service failed (Response: {}), switching to smart database fallback", aiResponse);
            
            // Xóa sạch nội dung cũ, thay bằng nội dung từ DB
            String fallbackContent = generateFallbackResponse(request.getContent(), finalContextEvents);
            aiResponse = fallbackContent;
            
            log.info("Fallback response generated successfully");
        }

        // Save AI message
        ChatMessage aiMessage = ChatMessage.builder()
                .chatSession(session)
                .role(ChatMessageRole.ASSISTANT)
                .type(ChatMessageType.TEXT)
                .content(aiResponse)
                .build();

        aiMessage = chatMessageRepository.save(aiMessage);

        // Generate quick replies (use default if AI is down)
        List<String> quickReplies;
        try {
            quickReplies = geminiChatService.generateQuickReplies(aiResponse, session.getContextType());
        } catch (Exception e) {
            quickReplies = List.of("Sự kiện nổi bật", "Cách đăng ký sự kiện", "Sự kiện sắp diễn ra");
        }

        // Send via WebSocket if available
        try {
            ChatMessageResponse response = mapMessageToResponse(aiMessage, quickReplies);
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + session.getSessionId(),
                    response);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket message: {}", e.getMessage());
        }

        return mapMessageToResponse(aiMessage, quickReplies);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatSessionResponse getSession(String sessionId, String userId) {
        ChatSession session = chatSessionRepository.findBySessionIdWithMessages(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        // Validate access
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to chat session");
        }

        return mapToResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getUserSessions(String userId) {
        if (userId == null) {
            throw new RuntimeException("User ID required");
        }

        List<ChatSession> sessions = chatSessionRepository.findByUserId(userId);
        return sessions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void endSession(String sessionId, String userId) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        // Validate access
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to chat session");
        }

        session.setStatus(ChatSessionStatus.ENDED);
        session.setEndedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        log.info("Ended chat session: {}", sessionId);
    }

    @Override
    @Transactional
    public void rateSession(String sessionId, Integer rating, String feedback, String userId) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        // Validate access
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to chat session");
        }

        session.setSatisfactionRating(rating);
        session.setFeedback(feedback);
        chatSessionRepository.save(session);

        log.info("Rated chat session: {} with rating: {}", sessionId, rating);
    }

    @Override
    @Transactional
    public EventPlanSuggestionResponse generateEventPlanFromChat(String sessionId, String userId) {
        ChatSession session = chatSessionRepository.findBySessionIdWithMessages(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        // Validate access
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to chat session");
        }

        // Get all messages
        List<ChatMessage> messages = session.getMessages();

        // Generate suggestion
        com.eventservice.dto.EventPlanSuggestion suggestion = geminiChatService.generateEventPlanSuggestion(
                "Tạo kế hoạch sự kiện từ cuộc hội thoại",
                messages);

        EventPlanSuggestionResponse responseDto = mapToResponse(suggestion);

        if (responseDto != null) {
            // Save as system message
            try {
                String suggestionJson = objectMapper.writeValueAsString(responseDto);
                ChatMessage systemMessage = ChatMessage.builder()
                        .chatSession(session)
                        .role(ChatMessageRole.SYSTEM)
                        .type(ChatMessageType.EVENT_PLAN_DRAFT)
                        .content("Đã tạo bản nháp kế hoạch sự kiện")
                        .metadata(suggestionJson)
                        .build();

                chatMessageRepository.save(systemMessage);
            } catch (Exception e) {
                log.error("Failed to save event plan suggestion: {}", e.getMessage());
            }
        }

        return responseDto;
    }

    @Override
    public List<String> getQuickReplies(String sessionId) {
        ChatSession session = chatSessionRepository.findBySessionIdWithMessages(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        List<ChatMessage> messages = session.getMessages();
        if (messages.isEmpty()) {
            return List.of(
                    "Tôi muốn tổ chức sự kiện",
                    "Xem các sự kiện sắp diễn ra",
                    "Hướng dẫn đăng ký sự kiện");
        }

        ChatMessage lastMessage = messages.get(messages.size() - 1);
        return geminiChatService.generateQuickReplies(lastMessage.getContent(), session.getContextType());
    }

    @Override
    public EventPlanSuggestionResponse extractFromText(String text) {
        if (text == null || text.isBlank())
            return null;
        log.info("Requesting AI to extract event details from provided text");
        return mapToResponse(geminiChatService.extractEventDetails(text));
    }

    private EventPlanSuggestionResponse mapToResponse(com.eventservice.dto.EventPlanSuggestion suggestion) {
        if (suggestion == null) return null;
        List<EventProgramItemSuggestionResponse> items = suggestion.getProgramItems() != null ?
                suggestion.getProgramItems().stream().map(i -> EventProgramItemSuggestionResponse.builder()
                        .title(i.getTitle())
                        .description(i.getDescription())
                        .startTime(i.getStartTime())
                        .endTime(i.getEndTime())
                        .durationMinutes(i.getDurationMinutes())
                        .speaker(i.getSpeaker())
                        .location(i.getLocation())
                        .notes(i.getNotes())
                        .build()).collect(Collectors.toList()) : new ArrayList<>();

        return EventPlanSuggestionResponse.builder()
                .title(suggestion.getTitle())
                .subject(suggestion.getSubject())
                .purpose(suggestion.getPurpose())
                .description(suggestion.getDescription())
                .suggestedStartTime(suggestion.getSuggestedStartTime())
                .suggestedEndTime(suggestion.getSuggestedEndTime())
                .suggestedLocation(suggestion.getSuggestedLocation())
                .estimatedParticipants(suggestion.getEstimatedParticipants())
                .programItems(items)
                .requiredResources(suggestion.getRequiredResources())
                .teamRoles(suggestion.getTeamRoles())
                .confidenceScore(suggestion.getConfidenceScore())
                .reasoning(suggestion.getReasoning())
                .additionalData(suggestion.getAdditionalData())
                .build();
    }

    private void sendWelcomeMessage(ChatSession session) {
        String welcomeText = """
                Xin chào! 👋

                Tôi là trợ lý AI của hệ thống quản lý sự kiện IUH. Tôi có thể giúp bạn:

                ✅ Tìm hiểu về các sự kiện sắp diễn ra
                ✅ Hướng dẫn đăng ký tham gia sự kiện
                ✅ Lập kế hoạch tổ chức sự kiện
                ✅ Trả lời các câu hỏi về quy trình

                Bạn cần hỗ trợ gì hôm nay?
                """;

        ChatMessage welcomeMessage = ChatMessage.builder()
                .chatSession(session)
                .role(ChatMessageRole.ASSISTANT)
                .type(ChatMessageType.TEXT)
                .content(welcomeText)
                .build();

        chatMessageRepository.save(welcomeMessage);
    }

    private String extractSearchKeyword(String message) {
        if (message == null || message.isBlank())
            return null;

        String lowerMsg = message.toLowerCase();

        if (lowerMsg.contains("nổi bật") || lowerMsg.contains("hot") || lowerMsg.contains("mới nhất")) {
            return ""; 
        }

        if (message.contains(":")) {
            String afterColon = message.substring(message.indexOf(":") + 1).trim();
            if (afterColon.length() > 2) return afterColon;
        }

        String cleaned = message
                .replaceAll(
                        "(?i)sự kiện|event|hội thảo|workshop|seminar|có gì|ở đâu|khi nào|bao giờ|là gì|cho tôi hỏi|giúp tôi",
                        "")
                .trim();

        if (cleaned.isEmpty())
            return null;

        if (cleaned.equals(cleaned.toUpperCase()) && cleaned.length() >= 2) {
            return cleaned;
        }

        String[] words = cleaned.split("\\s+");
        if (words.length > 3) {
            return words[0] + " " + words[1] + " " + words[2];
        }

        return cleaned;
    }

    private ChatSessionResponse mapToResponse(ChatSession session) {
        List<ChatMessageResponse> messageResponses = session.getMessages() != null
                ? session.getMessages().stream()
                        .map(m -> mapMessageToResponse(m, null))
                        .collect(Collectors.toList())
                : List.of();

        return ChatSessionResponse.builder()
                .id(session.getId())
                .sessionId(session.getSessionId())
                .userId(session.getUserId())
                .guestName(session.getGuestName())
                .guestEmail(session.getGuestEmail())
                .status(session.getStatus())
                .contextType(session.getContextType())
                .contextId(session.getContextId())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .endedAt(session.getEndedAt())
                .messages(messageResponses)
                .satisfactionRating(session.getSatisfactionRating())
                .feedback(session.getFeedback())
                .build();
    }

    private ChatMessageResponse mapMessageToResponse(ChatMessage message, List<String> quickReplies) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .sessionId(message.getChatSession().getSessionId())
                .role(message.getRole())
                .type(message.getType())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .isRead(message.getIsRead())
                .tokensUsed(message.getTokensUsed())
                .quickReplies(quickReplies)
                .build();
    }
    
    @Override
    @Transactional
    public void syncAllEventVectors() {
        log.info("Starting manual vector synchronization for all events");
        List<com.eventservice.entity.core.Event> events = eventRepository.findByIsDeletedFalseOrderByStartTimeDesc();
        log.info("Found {} events to sync", events.size());
        
        for (com.eventservice.entity.core.Event event : events) {
            eventEmbeddingService.upsertEventVector(event);
        }
        log.info("Dispatched {} events for embedding generation", events.size());
    }

    private double calculateCosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1.size() != v2.size()) return 0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < v1.size(); i++) {
            dotProduct += v1.get(i) * v2.get(i);
            normA += Math.pow(v1.get(i), 2);
            normB += Math.pow(v2.get(i), 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private String buildEventContext(List<com.eventservice.entity.core.Event> events) {
        if (events == null || events.isEmpty()) {
            return "Hiện tại không tìm thấy sự kiện phù hợp trong hệ thống.";
        }

        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        StringBuilder sb = new StringBuilder();
        
        for (com.eventservice.entity.core.Event e : events) {
            long regCount = eventRegistrationRepository.countByEventIdAndIsDeletedFalse(e.getId());
            
            sb.append(String.format("- [%s] %s\n", e.getStatus(), e.getTitle()));
            sb.append(String.format("  ID: %s\n", e.getId()));
            if (e.getSlug() != null) sb.append(String.format("  Slug: %s\n", e.getSlug()));
            if (e.getCoverImage() != null) sb.append(String.format("  Image: %s\n", e.getCoverImage()));
            if (e.getEventTopic() != null) sb.append(String.format("  Chủ đề: %s\n", e.getEventTopic()));
            if (e.getLocation() != null) sb.append(String.format("  Tại: %s\n", e.getLocation()));
            if (e.getStartTime() != null) sb.append(String.format("  Thời gian: %s\n", e.getStartTime().format(fmt)));
            
            sb.append(String.format("  Số người đăng ký hiện tại: %d\n", regCount));
            if (e.getMaxParticipants() > 0) sb.append(String.format("  Giới hạn tối đa: %d\n", e.getMaxParticipants()));
            
            if (e.getDescription() != null && !e.getDescription().isBlank()) {
                String desc = e.getDescription();
                if (desc.length() > 150)
                    desc = desc.substring(0, 147) + "...";
                sb.append(String.format("  Mô tả: %s\n", desc));
            }
            
            if (e.getPresenters() != null && !e.getPresenters().isEmpty()) {
                String names = e.getPresenters().stream()
                        .map(p -> p.getPresenterAccountId())
                        .collect(Collectors.joining(", "));
                sb.append(String.format("  Diễn giả: %s\n", names));
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    private String generateFallbackResponse(String userQuery, List<com.eventservice.entity.core.Event> contextEvents) {
        StringBuilder sb = new StringBuilder();
        String lowerMsg = userQuery.toLowerCase();
        
        boolean askingRegistration = lowerMsg.contains("đăng ký") || lowerMsg.contains("tham gia") 
                || lowerMsg.contains("hướng dẫn") || lowerMsg.contains("làm sao") 
                || lowerMsg.contains("register");

        sb.append("Chào bạn! 👋 Hiện tại hệ thống phản hồi thông minh đang xử lý hơi chậm một chút, nhưng tôi đã tìm thấy dữ liệu liên quan đến yêu cầu của bạn từ hệ thống IUH:\n\n");

        if (askingRegistration) {
            sb.append("📋 **Hướng dẫn đăng ký sự kiện:**\n\n");
            sb.append("1. Chọn sự kiện bạn muốn tham gia từ trang chủ\n");
            sb.append("2. Nhấn nút **\"Đăng ký\"** trên trang chi tiết sự kiện\n");
            sb.append("3. Điền thông tin và xác nhận\n");
            sb.append("4. Bạn sẽ nhận được mã QR để check-in\n\n");
            sb.append("💡 Lưu ý: Cần đăng nhập trước khi đăng ký!\n\n");
            sb.append("🤔 Bạn còn thắc mắc nào về quy trình đăng ký không?");
        } else if (contextEvents != null && !contextEvents.isEmpty()) {
            sb.append("🌟 **Dựa trên tìm kiếm của bạn, đây là các sự kiện nổi bật:**\n\n");

            int count = 0;
            for (com.eventservice.entity.core.Event e : contextEvents) {
                if (count >= 3) break;
                count++;
                
                long regCount = eventRegistrationRepository.countByEventIdAndIsDeletedFalse(e.getId());
                String hotTag = (regCount > 50) ? " 🔥 *Rất hot!*" : "";

                sb.append(String.format("🔹 **%s**%s\n", e.getTitle(), hotTag));
                if (e.getStartTime() != null) sb.append(String.format("   ⏰ Thời gian: %s\n", e.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
                if (e.getLocation() != null) sb.append(String.format("   📍 Địa điểm: %s\n", e.getLocation()));
                sb.append(String.format("   👥 Số người đã đăng ký: %d\n", regCount));
                sb.append("\n");
            }

            sb.append("🤔 Bạn có muốn tôi giúp bạn tìm hiểu chi tiết hơn về lịch trình hoặc diễn giả của các sự kiện này không?");
        } else {
            List<com.eventservice.entity.core.Event> latest = eventRepository.findByIsDeletedFalseOrderByStartTimeDesc().stream().limit(3).collect(Collectors.toList());
            
            if (!latest.isEmpty()) {
                sb.append("Rất tiếc tôi chưa tìm thấy sự kiện chính xác như bạn yêu cầu, nhưng tại IUH đang có những sự kiện mới nhất sau đây:\n\n");
                for (com.eventservice.entity.core.Event e : latest) {
                    sb.append(String.format("• **%s** (%s)\n", e.getTitle(), e.getLocation() != null ? e.getLocation() : "IUH"));
                }
                sb.append("\nBạn có quan tâm đến sự kiện nào ở trên không, hay bạn muốn tôi tìm kiếm theo một chủ đề khác? 😊");
            } else {
                sb.append("Hiện tại hệ thống chưa cập nhật các sự kiện mới. Bạn có thể quay lại sau hoặc cho tôi biết bạn đang quan tâm đến chủ đề gì để tôi ghi nhận nhé! 😊");
            }
        }

        return sb.toString();
    }

    @Override
    public String analyzeStatistics(String statsJson) {
        if (statsJson == null || statsJson.isBlank()) return null;
        log.info("Requesting AI to analyze event statistics");
        return geminiChatService.analyzeEventStatistics(statsJson);
    }
}
