package com.eventservice.service.impl;

import com.eventservice.dto.*;
import com.eventservice.entity.ChatMessage;
import com.eventservice.entity.ChatSession;
import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.entity.enums.ChatMessageType;
import com.eventservice.entity.enums.ChatSessionStatus;
import com.eventservice.repository.ChatMessageRepository;
import com.eventservice.repository.ChatSessionRepository;
import com.eventservice.repository.EventRepository;
import com.eventservice.service.ChatService;
import com.eventservice.service.GeminiChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {
    
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final EventRepository eventRepository;
    private final GeminiChatService geminiChatService;
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
        log.info("Created new chat session: {} for user: {}", session.getSessionId(), userId != null ? userId : "guest");
        
        // Send welcome message
        sendWelcomeMessage(session);
        
        return mapToResponse(session);
    }
    
    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, String userId) {
        // Get session or create a new one if not found (fixes 500 error when session expires/DB reset)
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
        
        // Get conversation history
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(request.getSessionId());
        
        // --- SMART RAG INTEGRATION ---
        List<com.eventservice.entity.Event> contextEvents;
        String userQuery = request.getContent();
        
        // Extract potential keywords (simple heuristic: words > 3 chars or uppercase)
        String keyword = extractSearchKeyword(userQuery);
        log.info("Extracted keyword for event search: {}", keyword);
        
        if (keyword != null && !keyword.isBlank()) {
            // Search for specific events matching the keyword
            contextEvents = eventRepository.searchByKeyword(keyword);
            log.info("Found {} events matching keyword: {}", contextEvents.size(), keyword);
            
            // If too few results, supplement with latest events
            if (contextEvents.size() < 3) {
                List<com.eventservice.entity.Event> latest = eventRepository.findByIsDeletedFalseOrderByStartTimeDesc();
                for (com.eventservice.entity.Event e : latest) {
                    if (contextEvents.size() >= 5) break;
                    if (contextEvents.stream().noneMatch(existing -> existing.getId().equals(e.getId()))) {
                        contextEvents.add(e);
                    }
                }
            }
        } else {
            // Fallback to latest events
            contextEvents = eventRepository.findByIsDeletedFalseOrderByStartTimeDesc();
        }
        
        // Limit to 10 most relevant events to save tokens and avoid 400 errors
        List<com.eventservice.entity.Event> finalContextEvents = contextEvents.size() > 10 
                ? new ArrayList<>(contextEvents.subList(0, 10)) 
                : new ArrayList<>(contextEvents);
        
        String eventContext = buildEventContext(finalContextEvents);

        String enhancedUserMessage = request.getContent();
        if (!eventContext.isEmpty()) {
            enhancedUserMessage = String.format("""
                === DỮ LIỆU SỰ KIỆN TỪ DATABASE HỆ THỐNG IUH ===
                %s
                === HẾT DỮ LIỆU ===
                
                HƯỚNG DẪN:
                - Dựa HOÀN TOÀN vào dữ liệu sự kiện ở trên để trả lời.
                - TUYỆT ĐỐI KHÔNG bịa đặt thông tin không có trong dữ liệu.
                - Khi user hỏi về sự kiện cụ thể, hãy tìm sự kiện khớp tên nhất trong dữ liệu và phân tích.
                - Nếu không tìm thấy sự kiện user hỏi trong dữ liệu trên, hãy nói rõ là "Tôi không tìm thấy sự kiện này trong hệ thống" và gợi ý các sự kiện có sẵn khác.
                - Trả lời bằng tiếng Việt, thân thiện, súc tích.
                
                CÂU HỎI CỦA NGƯỜI DÙNG: %s""", eventContext, request.getContent());
        }

        // Generate AI response
        String aiResponse = geminiChatService.generateChatResponse(
                enhancedUserMessage,
                history,
                session.getContextType()
        );
        
        // Save AI message
        ChatMessage aiMessage = ChatMessage.builder()
                .chatSession(session)
                .role(ChatMessageRole.ASSISTANT)
                .type(ChatMessageType.TEXT)
                .content(aiResponse)
                .build();
        
        aiMessage = chatMessageRepository.save(aiMessage);
        
        // Generate quick replies
        List<String> quickReplies = geminiChatService.generateQuickReplies(aiResponse, session.getContextType());

        // Send via WebSocket if available
        try {
            ChatMessageResponse response = mapMessageToResponse(aiMessage, quickReplies);
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + session.getSessionId(),
                    response
            );
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
    public EventPlanSuggestion generateEventPlanFromChat(String sessionId, String userId) {
        ChatSession session = chatSessionRepository.findBySessionIdWithMessages(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));
        
        // Validate access
        if (userId != null && session.getUserId() != null && !session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to chat session");
        }
        
        // Get all messages
        List<ChatMessage> messages = session.getMessages();
        
        // Generate suggestion
        EventPlanSuggestion suggestion = geminiChatService.generateEventPlanSuggestion(
                "Tạo kế hoạch sự kiện từ cuộc hội thoại",
                messages
        );
        
        if (suggestion != null) {
            // Save as system message
            try {
                String suggestionJson = objectMapper.writeValueAsString(suggestion);
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
        
        return suggestion;
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
                    "Hướng dẫn đăng ký sự kiện"
            );
        }
        
        ChatMessage lastMessage = messages.get(messages.size() - 1);
        return geminiChatService.generateQuickReplies(lastMessage.getContent(), session.getContextType());
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
    
    /**
     * Tách từ khóa chính từ câu hỏi của người dùng để tìm kiếm sự kiện.
     * Cải tiến để nhận diện các từ ngắn (AI, IUH, IT) và cụm từ đặc trưng.
     */
    private String extractSearchKeyword(String message) {
        if (message == null || message.isBlank()) return null;
        
        String lowerMsg = message.toLowerCase();
        
        // Nếu người dùng hỏi về "sự kiện nổi bật" hoặc tương tự mà không có tên cụ thể
        if (lowerMsg.contains("nổi bật") || lowerMsg.contains("hot") || lowerMsg.contains("mới nhất")) {
            return ""; // Trả về rỗng để kích hoạt fallback lấy sự kiện mới nhất
        }

        // Loại bỏ các từ phổ biến
        String cleaned = message
            .replaceAll("(?i)sự kiện|event|hội thảo|workshop|seminar|có gì|ở đâu|khi nào|bao giờ|là gì|cho tôi hỏi|giúp tôi", "")
            .trim();
            
        if (cleaned.isEmpty()) return null;
        
        // Nếu là từ viết hoa (AI, IUH, IT, AWS) thì giữ lại dù ngắn
        if (cleaned.equals(cleaned.toUpperCase()) && cleaned.length() >= 2) {
            return cleaned;
        }
        
        // Lấy 3 từ đầu tiên nếu quá dài để tìm kiếm hiệu quả hơn
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
    
    /**
     * Build comprehensive but concise event context for AI RAG.
     */
    private String buildEventContext(List<com.eventservice.entity.Event> events) {
        if (events == null || events.isEmpty()) {
            return "Hiện tại không tìm thấy sự kiện phù hợp trong hệ thống.";
        }
        
        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        StringBuilder sb = new StringBuilder();
        
        for (com.eventservice.entity.Event e : events) {
            sb.append(String.format("- [%s] %s\n", e.getStatus(), e.getTitle()));
            if (e.getEventTopic() != null) sb.append(String.format("  Chủ đề: %s\n", e.getEventTopic()));
            if (e.getLocation() != null) sb.append(String.format("  Tại: %s\n", e.getLocation()));
            if (e.getStartTime() != null) sb.append(String.format("  Thời gian: %s\n", e.getStartTime().format(fmt)));
            
            // Chỉ thêm mô tả ngắn (150 ký tự)
            if (e.getDescription() != null && !e.getDescription().isBlank()) {
                String desc = e.getDescription();
                if (desc.length() > 150) desc = desc.substring(0, 147) + "...";
                sb.append(String.format("  Mô tả: %s\n", desc));
            }
            
            // Chỉ liệt kê tên diễn giả
            if (e.getPresenters() != null && !e.getPresenters().isEmpty()) {
                String names = e.getPresenters().stream()
                    .map(p -> p.getFullName())
                    .collect(Collectors.joining(", "));
                sb.append(String.format("  Diễn giả: %s\n", names));
            }
            
            sb.append("\n");
        }
        
        return sb.toString();
    }
}
