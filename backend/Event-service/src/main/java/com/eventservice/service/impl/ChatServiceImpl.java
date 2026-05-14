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
public class ChatServiceImpl implements ChatService {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public ChatServiceImpl(
            ChatSessionRepository chatSessionRepository,
            ChatMessageRepository chatMessageRepository,
            EventRepository eventRepository,
            EventVectorRepository eventVectorRepository,
            GeminiChatService geminiChatService,
            EventEmbeddingService eventEmbeddingService,
            EventRegistrationRepository eventRegistrationRepository,
            GeminiAIService geminiAIService,
            TemplateRecommendationService templateRecommendationService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) EmbeddingModel embeddingModel,
            SimpMessagingTemplate messagingTemplate,
            ObjectMapper objectMapper
    ) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.eventRepository = eventRepository;
        this.eventVectorRepository = eventVectorRepository;
        this.geminiChatService = geminiChatService;
        this.eventEmbeddingService = eventEmbeddingService;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.geminiAIService = geminiAIService;
        this.templateRecommendationService = templateRecommendationService;
        this.embeddingModel = embeddingModel;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }


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
        // Get session or create a new one if not found
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

        // Validate session ownership
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
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

        // Analyze intent - OPTIMIZATION: Skip AI call to save time (it takes ~20s per call)
        String content = request.getContent();
        String intent = "GENERAL_QUESTION";
        /* 
        if (content.length() > 25) {
            try {
                intent = geminiChatService.analyzeUserIntent(content);
            } catch (Exception e) {
                log.warn("Intent analysis failed: {}", e.getMessage());
            }
        }
        */
        log.info("User intent (defaulted to save time): {}", intent);

        // Update context if needed
        if ("EVENT_PLANNING".equals(intent) && session.getContextType() == null) {
            session.setContextType("EVENT_PLANNING");
            chatSessionRepository.save(session);
        }

        // Get conversation history
        List<ChatMessage> fullHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getSessionId());
        List<ChatMessage> history = fullHistory.size() > 10 
                ? fullHistory.subList(fullHistory.size() - 10, fullHistory.size()) 
                : fullHistory;
        
        // --- SMART RAG INTEGRATION (VECTOR SEARCH) ---
        Set<com.eventservice.entity.core.Event> contextEventsSet = new LinkedHashSet<>();
        
        try {
            if (embeddingModel != null && content.length() > 5) {
                log.info("Performing Vector Search (max 5s) for query: {}", content);
                // Vector search is often slow if CPU is high, so we could skip or use a very short timeout if possible
                // For now, let's just catch any potential delay/error
                List<Double> queryEmbedding = embeddingModel.embed(content);
                List<EventVector> allVectors = eventVectorRepository.findAll();
                List<String> topEventIds = allVectors.stream()
                        .map(v -> new AbstractMap.SimpleEntry<>(v.getId(), calculateCosineSimilarity(queryEmbedding, v.getEmbedding())))
                        .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                        .filter(e -> e.getValue() > 0.65)
                        .limit(3)
                        .map(AbstractMap.SimpleEntry::getKey)
                        .collect(Collectors.toList());

                if (!topEventIds.isEmpty()) {
                    contextEventsSet.addAll(eventRepository.findAllById(topEventIds));
                }
            }
        } catch (Exception e) {
            log.error("Vector Search skipped due to error/delay: {}", e.getMessage());
        }

        // Keyword search fallback
        String keyword = extractSearchKeyword(content);
        if (keyword != null && !keyword.isBlank()) {
            contextEventsSet.addAll(eventRepository.searchByKeyword(keyword));
        }

        // Add latest events for context
        List<com.eventservice.entity.core.Event> latestEvents = eventRepository.findByIsDeletedFalseOrderByStartTimeDesc()
                .stream().limit(3).collect(Collectors.toList());
        contextEventsSet.addAll(latestEvents);
        
        List<com.eventservice.entity.core.Event> finalContextEvents = new ArrayList<>(contextEventsSet);
        String eventContext = buildEventContext(finalContextEvents);

        // Build enhanced message
        String userInfo = String.format("[CONTEXT: %s]\n", session.getContextType());
        String enhancedUserMessage = userInfo + content;
        
        if (!eventContext.isEmpty() && !"FEEDBACK".equals(intent)) {
            enhancedUserMessage = userInfo + String.format("""
                [DỮ LIỆU HỆ THỐNG]
                %s
                
                 Hãy trả lời câu hỏi: "%s"
                (Chỉ dùng dữ liệu trên, trả lời tự nhiên, thân thiện. KHÔNG hiển thị các ID kỹ thuật (UUID) cho người dùng. JSON thẻ sự kiện nếu có để trong [EVENT_CARDS_START]...[EVENT_CARDS_END])
                """, eventContext, content);
        }

        // Generate AI response
        long startTime = System.currentTimeMillis();
        String aiResponse = null;
        long duration = 0;
        
        try {
            aiResponse = geminiChatService.generateChatResponse(
                    enhancedUserMessage,
                    history,
                    session.getContextType()
            );
            duration = System.currentTimeMillis() - startTime;
            log.info("AI Response generated in {}ms", duration);
        } catch (Exception e) {
            log.error("AI Generation failed, will use fallback: {}", e.getMessage());
            aiResponse = "ERROR_AI_OVERLOADED";
        }

        // Fallback: If AI is slow/failed and returned a generic error
        if (aiResponse == null || aiResponse.isBlank() || aiResponse.contains("gián đoạn") || aiResponse.contains("không khả dụng") || aiResponse.equals("ERROR_AI_OVERLOADED")) {
            log.warn("AI service timed out or failed, using smart database fallback");
            aiResponse = generateFallbackResponse(content, finalContextEvents);
        }

        // Save AI message
        ChatMessage aiMessage = ChatMessage.builder()
                .chatSession(session)
                .role(ChatMessageRole.ASSISTANT)
                .type(ChatMessageType.TEXT)
                .content(aiResponse)
                .build();

        aiMessage = chatMessageRepository.save(aiMessage);

        // OPTIMIZATION: Quick Replies
        List<String> quickReplies;
        // If the response took more than 5 seconds, it's likely local AI. Skip AI quick replies to save time.
        if (duration > 5000 || aiResponse.length() > 1000) {
            log.info("Response took long or is very detailed, using default quick replies to save time");
            quickReplies = List.of("Tìm sự kiện nổi bật", "Cách đăng ký tham gia", "Xem lịch trình");
        } else {
            try {
                quickReplies = geminiChatService.generateQuickReplies(aiResponse, session.getContextType());
            } catch (Exception e) {
                quickReplies = List.of("Sự kiện nổi bật", "Cách đăng ký tham gia");
            }
        }

        // Send via WebSocket
        try {
            ChatMessageResponse response = mapMessageToResponse(aiMessage, quickReplies);
            messagingTemplate.convertAndSend("/topic/chat/" + session.getSessionId(), response);
        } catch (Exception e) {
            log.warn("WebSocket failed: {}", e.getMessage());
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
                .registrationDeadline(suggestion.getRegistrationDeadline())
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

    @Override
    public String generateMediaPost(String eventDetails) {
        log.info("Requesting AI to generate media post content");
        return geminiChatService.generateMediaPost(eventDetails);
    }
}
