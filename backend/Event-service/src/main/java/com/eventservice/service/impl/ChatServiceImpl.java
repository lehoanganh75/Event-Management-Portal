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
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.RegistrationStatus;
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
            ObjectMapper objectMapper,
            com.eventservice.service.EventRegistrationService eventRegistrationService
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
        this.eventRegistrationService = eventRegistrationService;
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
    private final com.eventservice.service.EventRegistrationService eventRegistrationService;

    @Override
    @Transactional
    public ChatSessionResponse createOrResumeSession(ChatSessionRequest request, String userId) {
        ChatSession session = null;

        // 1. If user is logged in, prioritize finding their latest active session in database
        if (userId != null) {
            List<ChatSession> userSessions = chatSessionRepository.findByUserId(userId);
            session = userSessions.stream()
                    .filter(s -> s.getStatus() == ChatSessionStatus.ACTIVE)
                    .max(Comparator.comparing(s -> s.getUpdatedAt() != null ? s.getUpdatedAt() : s.getCreatedAt()))
                    .orElse(null);

            if (session != null) {
                log.info("Resuming user's existing active session: {}", session.getSessionId());
                return mapToResponse(session);
            }
        }

        // 2. Otherwise, check if request contains a valid sessionId to resume
        if (request.getSessionId() != null) {
            ChatSession sessionBySessionId = chatSessionRepository.findBySessionId(request.getSessionId())
                    .orElse(null);

            if (sessionBySessionId != null && sessionBySessionId.getStatus() == ChatSessionStatus.ACTIVE) {
                // Double check ownership
                boolean ownerMatch = false;
                if (userId == null && sessionBySessionId.getUserId() == null) {
                    ownerMatch = true;
                } else if (userId != null && userId.equals(sessionBySessionId.getUserId())) {
                    ownerMatch = true;
                }

                if (ownerMatch) {
                    log.info("Resuming session by sessionId: {}", request.getSessionId());
                    return mapToResponse(sessionBySessionId);
                } else {
                    log.info("Session ownership mismatch. Request sessionId={}, session userId={}, current userId={}. Starting fresh.",
                            request.getSessionId(), sessionBySessionId.getUserId(), userId);
                }
            }
        }

        // 3. Create new session
        session = ChatSession.builder()
                .sessionId(UUID.randomUUID().toString())
                .userId(userId) // null for guest
                .guestName(request.getGuestName())
                .guestEmail(request.getGuestEmail())
                .status(ChatSessionStatus.ACTIVE)
                .contextType(request.getContextType() != null ? request.getContextType() : "GENERAL_INQUIRY")
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

        // Analyze intent using keyword/regex classifier
        String content = request.getContent();
        String intent = detectIntent(content);
        log.info("Detected intent: {}", intent);

        // Update context if needed
        if (("EVENT_PLANNING".equals(intent) || "GENERATE_EVENT_PLAN".equals(intent) || "GENERATE_PROGRAM_ITEMS".equals(intent)) 
                && session.getContextType() == null) {
            session.setContextType("EVENT_PLANNING");
            chatSessionRepository.save(session);
        }

        // Process specific intents directly if matched
        if ("REGISTER_EVENT".equals(intent)) {
            return processRegisterEvent(session, content, userId);
        } else if ("CANCEL_REGISTRATION".equals(intent)) {
            return processCancelRegistration(session, content, userId);
        } else if ("CHECK_EVENT_REGISTRATION_STATUS".equals(intent)) {
            return processCheckEventRegistrationStatus(session, content, userId);
        } else if ("FIND_MY_REGISTERED_EVENTS".equals(intent)) {
            return processFindMyRegisteredEvents(session, content, userId);
        } else if ("FIND_FEATURED_EVENTS".equals(intent) || "FIND_EVENTS".equals(intent) 
                || "FIND_UPCOMING_EVENTS".equals(intent) || "FIND_ONGOING_EVENTS".equals(intent)) {
            return processFindOrRecommendEvents(session, content, userId, intent);
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

    private String detectIntent(String content) {
        if (content == null || content.isBlank()) {
            return "GENERAL_QUESTION";
        }
        String lower = content.toLowerCase();
        
        // Check Find My Registered Events
        if (lower.contains("sự kiện tôi đã đăng ký") || lower.contains("sự kiện đã đăng ký") 
                || lower.contains("sự kiện tôi tham gia") || lower.contains("các sự kiện đã đăng ký")
                || lower.contains("lịch sử đăng ký") || lower.contains("my registered events")
                || lower.contains("danh sách sự kiện đã đăng ký")) {
            return "FIND_MY_REGISTERED_EVENTS";
        }
        
        // Check Cancel Registration
        if (lower.contains("hủy đăng ký") || lower.contains("hủy tham gia") 
                || lower.contains("cancel registration") || lower.contains("cancel event")) {
            return "CANCEL_REGISTRATION";
        }
        
        // Check Check Event Registration Status
        if ((lower.contains("đã đăng ký") && (lower.contains("chưa") || lower.contains("không")))
                || lower.contains("kiểm tra trạng thái đăng ký") || lower.contains("kiểm tra đăng ký")
                || lower.contains("trạng thái đăng ký của tôi")) {
            return "CHECK_EVENT_REGISTRATION_STATUS";
        }
        
        // Check Register Event
        if (lower.contains("đăng ký") || lower.contains("tham gia") || lower.contains("register")) {
            return "REGISTER_EVENT";
        }
        
        // Check Featured Events
        if (lower.contains("nổi bật") || lower.contains("đề xuất") || lower.contains("hot nhất") 
                || lower.contains("sự kiện hot") || lower.contains("featured")) {
            return "FIND_FEATURED_EVENTS";
        }
        
        // Check Event Plan
        if (lower.contains("tạo kế hoạch") || lower.contains("lập kế hoạch") || lower.contains("vạch kế hoạch") 
                || lower.contains("thiết lập kế hoạch") || lower.contains("event plan")) {
            return "GENERATE_EVENT_PLAN";
        }
        
        // Check program items
        if (lower.contains("gợi ý chương trình") || lower.contains("gợi ý session") || lower.contains("sắp xếp lịch trình") 
                || lower.contains("thiết kế chương trình") || lower.contains("program item")) {
            return "GENERATE_PROGRAM_ITEMS";
        }

        // Default to search if it looks like a query
        if (lower.contains("tìm") || lower.contains("có sự kiện") || lower.contains("gợi ý") 
                || lower.contains("sắp diễn ra") || lower.contains("đang diễn ra")) {
            return "FIND_EVENTS";
        }
        
        return "GENERAL_QUESTION";
    }

    private String extractEventNameFromMessage(String message) {
        if (message == null || message.isBlank()) return "";
        String lower = message.toLowerCase();
        String[] prefixes = {
            "đăng ký sự kiện", "đăng ký workshop", "đăng ký hội thảo", "đăng ký talkshow", "đăng ký",
            "hủy đăng ký sự kiện", "hủy đăng ký", "hủy tham gia",
            "tôi đã đăng ký sự kiện", "tôi đã đăng ký", "đã đăng ký sự kiện", "đã đăng ký",
            "kiểm tra đăng ký sự kiện", "kiểm tra đăng ký"
        };
        for (String prefix : prefixes) {
            int idx = lower.indexOf(prefix);
            if (idx != -1) {
                String candidate = message.substring(idx + prefix.length()).trim();
                candidate = candidate.replaceAll("[?\\.!]+$", "").trim();
                if (!candidate.isEmpty()) {
                    return candidate;
                }
            }
        }
        return "";
    }

    private List<com.eventservice.entity.core.Event> findMatchingEvents(String content) {
        String eventName = extractEventNameFromMessage(content);
        log.info("Extracted eventName candidate: '{}'", eventName);
        
        List<com.eventservice.entity.core.Event> matches = new ArrayList<>();
        if (eventName == null || eventName.trim().isEmpty()) {
            try {
                String prompt = String.format("""
                    Bạn là trợ lý trích xuất thông tin. Nhiệm vụ của bạn là phân tích tin nhắn người dùng và trích xuất ra duy nhất tên sự kiện (hội thảo, workshop, talkshow, ngày hội...) mà người dùng đang nhắc tới để đăng ký, hủy hoặc kiểm tra.
                    Tin nhắn: "%s"
                    Trả về DUY NHẤT tên sự kiện trích xuất được. Không giải thích, không thêm bớt từ nào khác. Nếu không có tên sự kiện nào, trả về chuỗi rỗng.
                    """, content);
                String geminiExtracted = geminiChatService.callGemini(prompt).trim();
                log.info("Gemini extracted eventName: '{}'", geminiExtracted);
                if (geminiExtracted.length() > 2 && !geminiExtracted.contains("ERROR_AI_OVERLOADED")) {
                    eventName = geminiExtracted;
                }
            } catch (Exception e) {
                log.warn("Gemini event extraction failed: {}", e.getMessage());
            }
        }
        
        if (eventName != null && !eventName.trim().isEmpty()) {
            eventName = eventName.replace("\"", "").replace("'", "").trim();
            Optional<com.eventservice.entity.core.Event> bySlug = eventRepository.findBySlugAndIsDeletedFalse(eventName);
            if (bySlug.isPresent()) {
                matches.add(bySlug.get());
            } else {
                matches = eventRepository.searchByKeyword(eventName);
            }
        }
        
        if (matches.isEmpty() && eventName != null && !eventName.trim().isEmpty()) {
            String finalName = eventName.toLowerCase();
            List<com.eventservice.entity.core.Event> allEvents = eventRepository.findByStatusInAndIsDeletedFalse(
                List.of(com.eventservice.entity.enums.EventStatus.PUBLISHED, com.eventservice.entity.enums.EventStatus.ONGOING)
            );
            matches = allEvents.stream()
                .filter(e -> e.getTitle().toLowerCase().contains(finalName) 
                          || finalName.contains(e.getTitle().toLowerCase()))
                .collect(Collectors.toList());
        }
        
        return matches;
    }

    private double calculateFeaturedScore(com.eventservice.entity.core.Event event, LocalDateTime now) {
        // 1. Registration Score (35%)
        double registrationScore = 0.0;
        int maxP = event.getMaxParticipants();
        int regCount = event.getRegisteredCount();
        if (maxP > 0) {
            registrationScore = Math.min(1.0, (double) regCount / maxP);
        } else {
            registrationScore = Math.min(1.0, (double) regCount / 100.0);
        }

        // 2. Feedback Score (25%)
        double feedbackScore = 0.8;
        if (event.getFeedbacks() != null && !event.getFeedbacks().isEmpty()) {
            double avg = event.getFeedbacks().stream()
                    .filter(f -> !f.isDeleted())
                    .mapToInt(f -> f.getRating() != null ? f.getRating() : 4)
                    .average()
                    .orElse(4.0);
            feedbackScore = avg / 5.0;
        }

        // 3. Recency Score (20%)
        double recencyScore = 0.0;
        if (event.getStartTime() != null) {
            if (event.getStatus() == com.eventservice.entity.enums.EventStatus.ONGOING) {
                recencyScore = 1.0;
            } else if (event.getStartTime().isAfter(now)) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(now, event.getStartTime());
                if (days <= 7) {
                    recencyScore = 1.0 - (days * 0.1);
                } else if (days <= 30) {
                    recencyScore = 0.3 - ((days - 7) * 0.01);
                }
                recencyScore = Math.max(0.0, recencyScore);
            } else {
                long days = java.time.temporal.ChronoUnit.DAYS.between(event.getEndTime() != null ? event.getEndTime() : event.getStartTime(), now);
                if (days <= 7) {
                    recencyScore = 0.5 - (days * 0.07);
                }
                recencyScore = Math.max(0.0, recencyScore);
            }
        }

        // 4. Interaction Score (15%)
        double interactionScore = 0.0;
        if (event.isCheckInEnabled()) interactionScore += 0.2;
        if (event.isFeedbackEnabled()) interactionScore += 0.2;
        if (event.isHasLuckyDraw()) interactionScore += 0.2;
        try {
            if (event.getPosts() != null) interactionScore += Math.min(0.2, event.getPosts().size() * 0.05);
            if (event.getQuizzes() != null) interactionScore += Math.min(0.2, event.getQuizzes().size() * 0.1);
        } catch (Exception e) {
            // Lazy load safeguard
        }
        interactionScore = Math.min(1.0, interactionScore);

        // 5. Completeness Score (5%)
        double completenessScore = 0.0;
        if (event.getDescription() != null && !event.getDescription().isBlank()) completenessScore += 0.2;
        if (event.getEventTopic() != null && !event.getEventTopic().isBlank()) completenessScore += 0.2;
        if (event.getLocation() != null && !event.getLocation().isBlank()) completenessScore += 0.2;
        if (event.getCoverImage() != null && !event.getCoverImage().isBlank()) completenessScore += 0.2;
        try {
            if (event.getPresenters() != null && !event.getPresenters().isEmpty()) completenessScore += 0.2;
        } catch (Exception e) {
            // Safe check
        }

        return (registrationScore * 0.35)
                + (feedbackScore * 0.25)
                + (recencyScore * 0.20)
                + (interactionScore * 0.15)
                + (completenessScore * 0.05);
    }

    private String generateFeaturedReason(com.eventservice.entity.core.Event event, LocalDateTime now) {
        List<String> factors = new ArrayList<>();
        
        int regCount = event.getRegisteredCount();
        if (regCount > 20) {
            factors.add("thu hút đông đảo người tham gia (" + regCount + " người đăng ký)");
        }
        
        if (event.getFeedbacks() != null && !event.getFeedbacks().isEmpty()) {
            double avg = event.getFeedbacks().stream()
                    .filter(f -> !f.isDeleted())
                    .mapToInt(f -> f.getRating() != null ? f.getRating() : 4)
                    .average()
                    .orElse(4.0);
            if (avg >= 4.0) {
                factors.add("được đánh giá rất cao (" + String.format("%.1f", avg) + "⭐)");
            }
        }
        
        if (event.getStatus() == com.eventservice.entity.enums.EventStatus.ONGOING) {
            factors.add("đang diễn ra sôi nổi");
        } else if (event.getStartTime() != null && event.getStartTime().isAfter(now)) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(now, event.getStartTime());
            if (days <= 3) {
                factors.add("sắp khởi tranh trong ít ngày tới");
            } else {
                factors.add("sắp diễn ra");
            }
        }
        
        try {
            if (event.getPresenters() != null && !event.getPresenters().isEmpty()) {
                factors.add("có sự góp mặt của các diễn giả uy tín");
            }
        } catch (Exception e) {
            // Safe check
        }
        
        if (factors.isEmpty()) {
            return "Sự kiện được đề xuất đặc biệt dành cho sinh viên IUH.";
        }
        
        StringBuilder sb = new StringBuilder("Sự kiện ");
        for (int i = 0; i < factors.size(); i++) {
            sb.append(factors.get(i));
            if (i < factors.size() - 2) {
                sb.append(", ");
            } else if (i == factors.size() - 2) {
                sb.append(" và ");
            }
        }
        sb.append(".");
        return sb.toString();
    }

    private String formatEventCardsJson(List<com.eventservice.entity.core.Event> events, LocalDateTime now) {
        if (events == null || events.isEmpty()) {
            return "";
        }
        
        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        StringBuilder sb = new StringBuilder();
        sb.append("\n\n[EVENT_CARDS_START]\n[\n");
        
        for (int i = 0; i < events.size(); i++) {
            com.eventservice.entity.core.Event e = events.get(i);
            double score = calculateFeaturedScore(e, now);
            String reason = generateFeaturedReason(e, now);
            
            sb.append("  {\n");
            sb.append(String.format("    \"id\": \"%s\",\n", e.getId()));
            sb.append(String.format("    \"title\": \"%s\",\n", escapeJson(e.getTitle())));
            sb.append(String.format("    \"date\": \"%s\",\n", e.getStartTime() != null ? e.getStartTime().format(fmt) : ""));
            sb.append(String.format("    \"location\": \"%s\",\n", e.getLocation() != null ? escapeJson(e.getLocation()) : ""));
            sb.append(String.format("    \"image\": \"%s\",\n", e.getCoverImage() != null ? escapeJson(e.getCoverImage()) : "/placeholder-event.jpg"));
            sb.append(String.format("    \"slug\": \"%s\",\n", e.getSlug() != null ? escapeJson(e.getSlug()) : ""));
            sb.append(String.format("    \"featuredScore\": %.2f,\n", score));
            sb.append(String.format("    \"reason\": \"%s\"\n", escapeJson(reason)));
            sb.append("  }");
            
            if (i < events.size() - 1) {
                sb.append(",");
            }
            sb.append("\n");
        }
        
        sb.append("]\n[EVENT_CARDS_END]");
        return sb.toString();
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
    }

    private String generateNaturalLanguageResponse(String userQuery, String action, String status, String message, String eventJson) {
        try {
            String prompt = String.format("""
                Bạn là trợ lý sự kiện IUH. Người dùng vừa gửi yêu cầu: "%s"
                Hành động: %s
                Trạng thái xử lý của hệ thống: %s
                Thông báo từ hệ thống: %s
                Dữ liệu sự kiện liên quan: %s
                
                Nhiệm vụ:
                - Trả lời tự nhiên, ngắn gọn bằng tiếng Việt thân thiện.
                - Không bịa thêm thông tin ngoài hệ thống cung cấp.
                - Nếu thao tác thành công (đăng ký/hủy thành công), hãy chúc mừng hoặc chia sẻ niềm vui với người dùng.
                - Nếu thất bại (quá hạn, chưa đăng nhập, sự kiện kết thúc/hủy, hết chỗ, trùng lịch), giải thích lý do rõ ràng, lịch sự.
                - Nếu hệ thống trả về thông báo cần chọn sự kiện, hãy yêu cầu người dùng chọn một trong các sự kiện hiển thị bên dưới.
                - KHÔNG kèm mã JSON thẻ sự kiện trong câu trả lời của bạn. Chỉ trả lời phần văn bản tự nhiên.
                """, userQuery, action, status, message, eventJson);
            String response = geminiChatService.callGemini(prompt);
            if (response != null && !response.isBlank() && !response.contains("ERROR_AI_OVERLOADED")) {
                return response.trim();
            }
        } catch (Exception e) {
            log.warn("Gemini call failed for natural response: {}", e.getMessage());
        }
        return message;
    }

    private ChatMessageResponse saveAndBroadcastAssistantMessage(ChatSession session, String content, List<String> quickReplies) {
        ChatMessage aiMessage = ChatMessage.builder()
                .chatSession(session)
                .role(ChatMessageRole.ASSISTANT)
                .type(ChatMessageType.TEXT)
                .content(content)
                .build();

        aiMessage = chatMessageRepository.save(aiMessage);

        try {
            ChatMessageResponse response = mapMessageToResponse(aiMessage, quickReplies);
            messagingTemplate.convertAndSend("/topic/chat/" + session.getSessionId(), response);
            return response;
        } catch (Exception e) {
            log.warn("WebSocket failed: {}", e.getMessage());
            return mapMessageToResponse(aiMessage, quickReplies);
        }
    }

    private ChatMessageResponse processRegisterEvent(ChatSession session, String content, String userId) {
        if (userId == null) {
            String aiResponse = "Bạn cần đăng nhập hệ thống để thực hiện đăng ký sự kiện. Vui lòng đăng nhập và thử lại nhé! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Đăng nhập hệ thống"));
        }
        
        List<com.eventservice.entity.core.Event> matches = findMatchingEvents(content);
        if (matches.isEmpty()) {
            String aiResponse = "Tôi chưa tìm thấy sự kiện nào khớp với tên bạn yêu cầu trong hệ thống. Bạn vui lòng kiểm tra lại tên sự kiện hoặc thử tìm kiếm các sự kiện nổi bật nhé! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Tìm sự kiện nổi bật", "Sự kiện sắp diễn ra"));
        }
        
        if (matches.size() > 1) {
            String message = "Tôi tìm thấy nhiều sự kiện có tên gần giống. Bạn vui lòng chọn sự kiện muốn đăng ký dưới đây:";
            String aiResponse = message + formatEventCardsJson(matches, LocalDateTime.now());
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Quay lại"));
        }
        
        com.eventservice.entity.core.Event event = matches.get(0);
        LocalDateTime now = LocalDateTime.now();
        
        String denyReason = null;
        String status = "SUCCESS";
        if (event.isDeleted()) {
            denyReason = "EVENT_NOT_FOUND";
        } else if (event.getStatus() == com.eventservice.entity.enums.EventStatus.DRAFT) {
            denyReason = "EVENT_NOT_OPEN";
        } else if (event.getStatus() == com.eventservice.entity.enums.EventStatus.CANCELLED) {
            denyReason = "EVENT_CANCELLED";
        } else if (event.getEndTime() != null && now.isAfter(event.getEndTime())) {
            denyReason = "EVENT_ENDED";
        } else if (event.getRegistrationDeadline() != null && now.isAfter(event.getRegistrationDeadline())) {
            denyReason = "REGISTRATION_CLOSED";
        } else if (event.getRegisteredCount() >= event.getMaxParticipants()) {
            denyReason = "EVENT_FULL";
        } else {
            boolean alreadyReg = eventRegistrationRepository.existsByEventIdAndParticipantAccountIdAndIsDeletedFalse(event.getId(), userId);
            if (alreadyReg) {
                denyReason = "ALREADY_REGISTERED";
            }
        }
        
        String actionMessage;
        if (denyReason == null) {
            try {
                eventRegistrationService.registerForEvent(event.getId(), userId);
                actionMessage = "Đăng ký thành công tham gia sự kiện '" + event.getTitle() + "'.";
            } catch (org.springframework.web.server.ResponseStatusException rse) {
                status = "FAILED";
                denyReason = rse.getReason();
                actionMessage = "Đăng ký thất bại: " + rse.getReason();
            } catch (Exception e) {
                status = "FAILED";
                denyReason = "REGISTRATION_ERROR";
                actionMessage = "Đăng ký thất bại: " + e.getMessage();
            }
        } else {
            status = "FAILED";
            actionMessage = switch (denyReason) {
                case "EVENT_NOT_FOUND" -> "Không tìm thấy sự kiện này hoặc sự kiện đã bị xóa.";
                case "EVENT_NOT_OPEN" -> "Sự kiện hiện tại chưa mở đăng ký.";
                case "EVENT_CANCELLED" -> "Sự kiện này đã bị hủy bỏ bởi ban tổ chức.";
                case "EVENT_ENDED" -> "Sự kiện này đã kết thúc nên không thể đăng ký.";
                case "REGISTRATION_CLOSED" -> "Sự kiện này đã quá hạn đăng ký.";
                case "EVENT_FULL" -> "Sự kiện đã hết chỗ đăng ký.";
                case "ALREADY_REGISTERED" -> "Bạn đã đăng ký tham gia sự kiện này rồi.";
                default -> "Không thể thực hiện đăng ký.";
            };
        }
        
        String eventJson = String.format("{\"title\":\"%s\",\"location\":\"%s\",\"startTime\":\"%s\"}", 
            event.getTitle(), event.getLocation(), event.getStartTime());
        String naturalReply = generateNaturalLanguageResponse(content, "ĐĂNG KÝ SỰ KIỆN", status, actionMessage, eventJson);
        naturalReply += formatEventCardsJson(List.of(event), now);
        return saveAndBroadcastAssistantMessage(session, naturalReply, List.of("Xem sự kiện đã đăng ký", "Sự kiện nổi bật"));
    }

    private ChatMessageResponse processCancelRegistration(ChatSession session, String content, String userId) {
        if (userId == null) {
            String aiResponse = "Bạn cần đăng nhập hệ thống để thực hiện hủy đăng ký sự kiện. Vui lòng đăng nhập và thử lại nhé! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Đăng nhập hệ thống"));
        }
        
        List<com.eventservice.entity.core.Event> matches = findMatchingEvents(content);
        if (matches.isEmpty()) {
            String aiResponse = "Tôi chưa tìm thấy sự kiện nào khớp với yêu cầu hủy đăng ký của bạn. Vui lòng kiểm tra lại tên sự kiện nhé! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Xem sự kiện đã đăng ký"));
        }
        
        if (matches.size() > 1) {
            String message = "Tôi tìm thấy nhiều sự kiện có tên gần giống. Bạn vui lòng chọn sự kiện muốn hủy đăng ký dưới đây:";
            String aiResponse = message + formatEventCardsJson(matches, LocalDateTime.now());
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Quay lại"));
        }
        
        com.eventservice.entity.core.Event event = matches.get(0);
        LocalDateTime now = LocalDateTime.now();
        
        Optional<com.eventservice.entity.registration.EventRegistration> regOpt = 
            eventRegistrationRepository.findByEventIdAndParticipantAccountId(event.getId(), userId);
        
        String denyReason = null;
        String status = "SUCCESS";
        
        if (regOpt.isEmpty() || regOpt.get().isDeleted() || regOpt.get().getStatus() == com.eventservice.entity.enums.RegistrationStatus.CANCELLED) {
            denyReason = "NOT_REGISTERED";
        } else {
            com.eventservice.entity.registration.EventRegistration reg = regOpt.get();
            if (reg.isCheckedIn()) {
                denyReason = "ALREADY_CHECKED_IN";
            } else {
                LocalDateTime cancelDeadline = event.getStartTime().minusMinutes(30);
                if (now.isAfter(cancelDeadline)) {
                    denyReason = "PAST_CANCEL_DEADLINE";
                }
            }
        }
        
        String actionMessage;
        if (denyReason == null) {
            try {
                eventRegistrationService.cancelRegistration(event.getId(), userId);
                actionMessage = "Hủy đăng ký thành công cho sự kiện '" + event.getTitle() + "'.";
            } catch (Exception e) {
                status = "FAILED";
                denyReason = "CANCEL_ERROR";
                actionMessage = "Hủy đăng ký thất bại: " + e.getMessage();
            }
        } else {
            status = "FAILED";
            actionMessage = switch (denyReason) {
                case "NOT_REGISTERED" -> "Bạn chưa đăng ký tham gia sự kiện này.";
                case "ALREADY_CHECKED_IN" -> "Không thể hủy vì bạn đã thực hiện check-in rồi.";
                case "PAST_CANCEL_DEADLINE" -> "Đã quá hạn hủy đăng ký (Hạn cuối là 30 phút trước khi sự kiện diễn ra).";
                default -> "Không thể thực hiện hủy đăng ký.";
            };
        }
        
        String eventJson = String.format("{\"title\":\"%s\",\"location\":\"%s\"}", event.getTitle(), event.getLocation());
        String naturalReply = generateNaturalLanguageResponse(content, "HỦY ĐĂNG KÝ SỰ KIỆN", status, actionMessage, eventJson);
        naturalReply += formatEventCardsJson(List.of(event), now);
        return saveAndBroadcastAssistantMessage(session, naturalReply, List.of("Sự kiện nổi bật", "Quay lại"));
    }

    private ChatMessageResponse processCheckEventRegistrationStatus(ChatSession session, String content, String userId) {
        if (userId == null) {
            String aiResponse = "Bạn cần đăng nhập để kiểm tra trạng thái đăng ký sự kiện. Vui lòng đăng nhập và thử lại! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Đăng nhập hệ thống"));
        }
        
        List<com.eventservice.entity.core.Event> matches = findMatchingEvents(content);
        if (matches.isEmpty()) {
            String aiResponse = "Tôi chưa tìm thấy sự kiện nào khớp với yêu cầu kiểm tra của bạn. Vui lòng kiểm tra lại tên sự kiện nhé! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Xem các sự kiện"));
        }
        
        if (matches.size() > 1) {
            String message = "Tôi tìm thấy nhiều sự kiện có tên gần giống. Bạn vui lòng chọn sự kiện muốn kiểm tra:";
            String aiResponse = message + formatEventCardsJson(matches, LocalDateTime.now());
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Quay lại"));
        }
        
        com.eventservice.entity.core.Event event = matches.get(0);
        Optional<com.eventservice.entity.registration.EventRegistration> regOpt = 
            eventRegistrationRepository.findByEventIdAndParticipantAccountId(event.getId(), userId);
        
        String status = "SUCCESS";
        String actionMessage;
        if (regOpt.isEmpty() || regOpt.get().isDeleted() || regOpt.get().getStatus() == com.eventservice.entity.enums.RegistrationStatus.CANCELLED) {
            actionMessage = "Bạn chưa đăng ký tham gia sự kiện này.";
        } else {
            com.eventservice.entity.registration.EventRegistration reg = regOpt.get();
            if (reg.isCheckedIn()) {
                actionMessage = "Bạn đã đăng ký và ĐÃ check-in tham gia sự kiện này lúc " + 
                    (reg.getCheckInTime() != null ? reg.getCheckInTime().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "n/a") + ".";
            } else {
                actionMessage = "Bạn đã đăng ký thành công sự kiện này và vé đang ở trạng thái hoạt động (Chưa check-in).";
            }
        }
        
        String eventJson = String.format("{\"title\":\"%s\",\"location\":\"%s\"}", event.getTitle(), event.getLocation());
        String naturalReply = generateNaturalLanguageResponse(content, "KIỂM TRA TRẠNG THÁI ĐĂNG KÝ", status, actionMessage, eventJson);
        naturalReply += formatEventCardsJson(List.of(event), LocalDateTime.now());
        return saveAndBroadcastAssistantMessage(session, naturalReply, List.of("Hủy đăng ký sự kiện này", "Quay lại"));
    }

    private ChatMessageResponse processFindMyRegisteredEvents(ChatSession session, String content, String userId) {
        if (userId == null) {
            String aiResponse = "Bạn cần đăng nhập để xem danh sách sự kiện đã đăng ký. Vui lòng đăng nhập và thử lại nhé! 😊";
            return saveAndBroadcastAssistantMessage(session, aiResponse, List.of("Đăng nhập hệ thống"));
        }
        
        List<com.eventservice.entity.registration.EventRegistration> regs = 
            eventRegistrationRepository.findByParticipantAccountId(userId);
        
        List<com.eventservice.entity.core.Event> myEvents = regs.stream()
            .filter(r -> r.getStatus() == com.eventservice.entity.enums.RegistrationStatus.REGISTERED 
                      || r.getStatus() == com.eventservice.entity.enums.RegistrationStatus.ATTENDED)
            .map(com.eventservice.entity.registration.EventRegistration::getEvent)
            .filter(e -> !e.isDeleted())
            .collect(Collectors.toList());
        
        String actionMessage;
        if (myEvents.isEmpty()) {
            actionMessage = "Bạn hiện chưa đăng ký tham gia sự kiện nào.";
        } else {
            actionMessage = "Bạn đã đăng ký tham gia " + myEvents.size() + " sự kiện dưới đây.";
        }
        
        String naturalReply = generateNaturalLanguageResponse(content, "TÌM SỰ KIỆN ĐÃ ĐĂNG KÝ", "SUCCESS", actionMessage, "[]");
        naturalReply += formatEventCardsJson(myEvents, LocalDateTime.now());
        return saveAndBroadcastAssistantMessage(session, naturalReply, List.of("Tìm sự kiện nổi bật", "Quay lại"));
    }

    private ChatMessageResponse processFindOrRecommendEvents(ChatSession session, String content, String userId, String intent) {
        LocalDateTime now = LocalDateTime.now();
        List<com.eventservice.entity.core.Event> allEvents = eventRepository.findByStatusInAndIsDeletedFalse(
            List.of(com.eventservice.entity.enums.EventStatus.PUBLISHED, com.eventservice.entity.enums.EventStatus.ONGOING)
        );
        
        List<com.eventservice.entity.core.Event> filtered = allEvents.stream()
            .filter(e -> {
                if ("FIND_UPCOMING_EVENTS".equals(intent)) {
                    return e.getStartTime() != null && e.getStartTime().isAfter(now);
                }
                if ("FIND_ONGOING_EVENTS".equals(intent)) {
                    return e.getStatus() == com.eventservice.entity.enums.EventStatus.ONGOING 
                        || (e.getStartTime() != null && e.getStartTime().isBefore(now) && e.getEndTime() != null && e.getEndTime().isAfter(now));
                }
                return true;
            })
            .collect(Collectors.toList());

        // Date extraction
        int targetStartDay = -1;
        int targetStartMonth = now.getMonthValue();
        int targetStartYear = now.getYear();
        
        int targetEndDay = -1;
        int targetEndMonth = now.getMonthValue();
        int targetEndYear = now.getYear();
        
        boolean hasDateFilter = false;
        boolean isRange = false;

        String lowerContent = content.toLowerCase();
        
        // Range Pattern: e.g. "từ ngày 24 đến ngày 27", "24/05 đến 27/05", "ngày 24 - 27 tháng 5"
        java.util.regex.Pattern rangePattern = java.util.regex.Pattern.compile(
            "(?i)(?:từ\\s+)?(?:ngày\\s+)?(\\d{1,2})(?:\\s*[/.-]\\s*(\\d{1,2}))?\\s+(?:đến|\\-|\\bsang\\b)\\s+(?:ngày\\s+)?(\\d{1,2})(?:\\s*[/.-]\\s*(\\d{1,2}))?(?:\\s+tháng\\s+(\\d{1,2}))?(?:\\s+năm\\s+(\\d{4}))?"
        );
        java.util.regex.Matcher mRange = rangePattern.matcher(lowerContent);
        if (mRange.find()) {
            targetStartDay = Integer.parseInt(mRange.group(1));
            targetEndDay = Integer.parseInt(mRange.group(3));
            
            int mVal = now.getMonthValue();
            if (mRange.group(5) != null) {
                mVal = Integer.parseInt(mRange.group(5));
            }
            
            int startM = mRange.group(2) != null ? Integer.parseInt(mRange.group(2)) : mVal;
            int endM = mRange.group(4) != null ? Integer.parseInt(mRange.group(4)) : mVal;
            
            if (mRange.group(2) == null && mRange.group(4) != null) {
                startM = endM;
            } else if (mRange.group(2) != null && mRange.group(4) == null) {
                endM = startM;
            }
            
            targetStartMonth = startM;
            targetEndMonth = endM;
            
            int yVal = now.getYear();
            if (mRange.group(6) != null) {
                yVal = Integer.parseInt(mRange.group(6));
            }
            targetStartYear = yVal;
            targetEndYear = yVal;
            
            hasDateFilter = true;
            isRange = true;
        } else {
            // Pattern 1: ngày X tháng Y năm Z hoặc ngày X tháng Y
            java.util.regex.Pattern p1 = java.util.regex.Pattern.compile("(?i)ngày\\s+(\\d{1,2})\\s+tháng\\s+(\\d{1,2})(?:\\s+năm\\s+(\\d{4}))?");
            java.util.regex.Matcher m1 = p1.matcher(lowerContent);
            if (m1.find()) {
                targetStartDay = Integer.parseInt(m1.group(1));
                targetStartMonth = Integer.parseInt(m1.group(2));
                if (m1.group(3) != null) {
                    targetStartYear = Integer.parseInt(m1.group(3));
                }
                hasDateFilter = true;
            } else {
                // Pattern 2: X/Y/Z hoặc X/Y hoặc X-Y
                java.util.regex.Pattern p2 = java.util.regex.Pattern.compile("(\\d{1,2})[/-](\\d{1,2})(?:[/-](\\d{4}))?");
                java.util.regex.Matcher m2 = p2.matcher(lowerContent);
                if (m2.find()) {
                    targetStartDay = Integer.parseInt(m2.group(1));
                    targetStartMonth = Integer.parseInt(m2.group(2));
                    if (m2.group(3) != null) {
                        targetStartYear = Integer.parseInt(m2.group(3));
                    }
                    hasDateFilter = true;
                } else {
                    // Pattern 3: ngày X (lấy tháng và năm hiện tại)
                    java.util.regex.Pattern p3 = java.util.regex.Pattern.compile("(?i)ngày\\s+(\\d{1,2})");
                    java.util.regex.Matcher m3 = p3.matcher(lowerContent);
                    if (m3.find()) {
                        targetStartDay = Integer.parseInt(m3.group(1));
                        hasDateFilter = true;
                    }
                }
            }
        }

        // Apply Date Filter if present
        if (hasDateFilter) {
            final int finalStartDay = targetStartDay;
            final int finalStartMonth = targetStartMonth;
            final int finalStartYear = targetStartYear;
            
            final int finalEndDay = targetEndDay;
            final int finalEndMonth = targetEndMonth;
            final int finalEndYear = targetEndYear;
            
            final boolean finalIsRange = isRange;
            
            List<com.eventservice.entity.core.Event> temp = filtered.stream()
                .filter(e -> {
                    if (e.getStartTime() == null) return false;
                    java.time.LocalDate startDate = e.getStartTime().toLocalDate();
                    try {
                        if (finalIsRange) {
                            java.time.LocalDate targetStartDate = java.time.LocalDate.of(finalStartYear, finalStartMonth, finalStartDay);
                            java.time.LocalDate targetEndDate = java.time.LocalDate.of(finalEndYear, finalEndMonth, finalEndDay);
                            return !startDate.isBefore(targetStartDate) && !startDate.isAfter(targetEndDate);
                        } else {
                            java.time.LocalDate targetDate = java.time.LocalDate.of(finalStartYear, finalStartMonth, finalStartDay);
                            return startDate.equals(targetDate);
                        }
                    } catch (Exception ex) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
            
            filtered = temp;
        }

        // Apply Keyword Filter if present
        String keyword = extractSearchKeyword(content);
        if (keyword != null && !keyword.isBlank()) {
            String cleanedKw = keyword.replaceAll("(?i)ngày\\s+\\d+|tháng\\s+\\d+|năm\\s+\\d+|\\d+[/-]\\d+", "").trim();
            cleanedKw = cleanedKw.replaceAll("(?i)diễn ra|vào|không|nào|có|gì|ngày|từ|đến", "").trim();
            if (cleanedKw.length() > 2) {
                final String finalKw = cleanedKw.toLowerCase();
                List<com.eventservice.entity.core.Event> temp = filtered.stream()
                    .filter(e -> {
                        String title = e.getTitle() != null ? e.getTitle().toLowerCase() : "";
                        String topic = e.getEventTopic() != null ? e.getEventTopic().toLowerCase() : "";
                        String desc = e.getDescription() != null ? e.getDescription().toLowerCase() : "";
                        String loc = e.getLocation() != null ? e.getLocation().toLowerCase() : "";
                        return title.contains(finalKw) || topic.contains(finalKw) || desc.contains(finalKw) || loc.contains(finalKw);
                    })
                    .collect(Collectors.toList());
                
                if (!temp.isEmpty()) {
                    filtered = temp;
                }
            }
        }

        // Sort the filtered events by featuredScore
        filtered.sort((e1, e2) -> Double.compare(calculateFeaturedScore(e2, now), calculateFeaturedScore(e1, now)));
            
        int limit = 4;
        if (content.contains(" 5 ") || content.toLowerCase().contains("năm sự kiện")) {
            limit = 5;
        }
        List<com.eventservice.entity.core.Event> topEvents = filtered.stream().limit(limit).collect(Collectors.toList());
        
        String actionMessage;
        if (topEvents.isEmpty()) {
            actionMessage = "Hiện tại không tìm thấy sự kiện nào phù hợp.";
        } else {
            actionMessage = "Tìm thấy " + topEvents.size() + " sự kiện nổi bật phù hợp.";
        }
        
        String prompt = String.format("""
            Bạn là trợ lý sự kiện IUH. Người dùng vừa hỏi: "%s"
            Hệ thống đã chọn ra danh sách sự kiện nổi bật/sắp diễn ra/đang diễn ra sau:
            %s
            
            Nhiệm vụ:
            - Trả lời tự nhiên, giới thiệu hấp dẫn và thân thiện các sự kiện này bằng tiếng Việt.
            - Giải thích ngắn gọn lý do tại sao các sự kiện này lại nổi bật hoặc phù hợp với họ (ví dụ: thu hút đông người đăng ký, được đánh giá tốt, sắp khởi tranh).
            - KHÔNG kèm mã JSON thẻ sự kiện trong câu trả lời của bạn. Chỉ trả lời phần văn bản tự nhiên.
            """, content, buildEventContext(topEvents));
        
        String naturalReply = geminiChatService.callGemini(prompt);
        naturalReply += formatEventCardsJson(topEvents, now);
        
        return saveAndBroadcastAssistantMessage(session, naturalReply, List.of("Cách đăng ký tham gia", "Xem lịch trình"));
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
