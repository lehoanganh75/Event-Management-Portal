package com.eventservice.controller;

import com.eventservice.dto.*;
import com.eventservice.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatService chatService;
    
    /**
     * Create or resume chat session (Public - for guests)
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> createOrResumeSession(
            @Valid @RequestBody ChatSessionRequest request
    ) {
        log.info("Incoming chat session request for sessionId: {}", request.getSessionId());
        String userId = getCurrentUserId(); // null for guest
        ChatSessionResponse response = chatService.createOrResumeSession(request, userId);
        
        return ResponseEntity.ok(ApiResponse.<ChatSessionResponse>builder()
                .code(1000)
                .message("Chat session created successfully")
                .result(response)
                .build());
    }
    
    /**
     * Send message to chat (Public - for guests)
     */
    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request
    ) {
        log.info("Incoming chat message request for sessionId: {}", request.getSessionId());
        String userId = getCurrentUserId(); // null for guest
        ChatMessageResponse response = chatService.sendMessage(request, userId);
        
        return ResponseEntity.ok(ApiResponse.<ChatMessageResponse>builder()
                .code(1000)
                .message("Message sent successfully")
                .result(response)
                .build());
    }
    
    /**
     * Get chat session with messages
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> getSession(
            @PathVariable String sessionId
    ) {
        String userId = getCurrentUserId();
        ChatSessionResponse response = chatService.getSession(sessionId, userId);
        
        return ResponseEntity.ok(ApiResponse.<ChatSessionResponse>builder()
                .code(1000)
                .message("Session retrieved successfully")
                .result(response)
                .build());
    }
    
    /**
     * Get all sessions for authenticated user
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> getUserSessions() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<ChatSessionResponse>>builder()
                    .code(4001)
                    .message("Authentication required")
                    .build());
        }
        
        List<ChatSessionResponse> response = chatService.getUserSessions(userId);
        
        return ResponseEntity.ok(ApiResponse.<List<ChatSessionResponse>>builder()
                .code(1000)
                .message("Sessions retrieved successfully")
                .result(response)
                .build());
    }
    
    /**
     * End chat session
     */
    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<ApiResponse<Void>> endSession(
            @PathVariable String sessionId
    ) {
        String userId = getCurrentUserId();
        chatService.endSession(sessionId, userId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Session ended successfully")
                .build());
    }
    
    /**
     * Rate chat session
     */
    @PostMapping("/sessions/{sessionId}/rate")
    public ResponseEntity<ApiResponse<Void>> rateSession(
            @PathVariable String sessionId,
            @RequestBody RatingRequest request
    ) {
        String userId = getCurrentUserId();
        chatService.rateSession(sessionId, request.getRating(), request.getFeedback(), userId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Session rated successfully")
                .build());
    }
    
    /**
     * Generate event plan from chat conversation
     */
    @PostMapping("/sessions/{sessionId}/generate-plan")
    public ResponseEntity<ApiResponse<EventPlanSuggestion>> generateEventPlan(
            @PathVariable String sessionId
    ) {
        String userId = getCurrentUserId();
        EventPlanSuggestion suggestion = chatService.generateEventPlanFromChat(sessionId, userId);
        
        if (suggestion == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<EventPlanSuggestion>builder()
                    .code(4002)
                    .message("Unable to generate event plan from conversation")
                    .build());
        }
        
        return ResponseEntity.ok(ApiResponse.<EventPlanSuggestion>builder()
                .code(1000)
                .message("Event plan generated successfully")
                .result(suggestion)
                .build());
    }
    
    /**
     * Get quick reply suggestions
     */
    @GetMapping("/sessions/{sessionId}/quick-replies")
    public ResponseEntity<ApiResponse<List<String>>> getQuickReplies(
            @PathVariable String sessionId
    ) {
        List<String> replies = chatService.getQuickReplies(sessionId);
        
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .code(1000)
                .message("Quick replies retrieved successfully")
                .result(replies)
                .build());
    }

    /**
     * Extract event details from raw text (AI-powered)
     */
    @PostMapping("/extract-from-text")
    public ResponseEntity<ApiResponse<EventPlanSuggestion>> extractFromText(
            @RequestBody String text
    ) {
        log.info("Incoming AI extraction request for text length: {}", text.length());
        EventPlanSuggestion suggestion = chatService.extractFromText(text);
        
        return ResponseEntity.ok(ApiResponse.<EventPlanSuggestion>builder()
                .code(1000)
                .message("Event details extracted successfully")
                .result(suggestion)
                .build());
    }

    /**
     * Analyze event statistics and provide insights (AI-powered)
     */
    @PostMapping("/analyze-stats")
    public ResponseEntity<ApiResponse<String>> analyzeStats(
            @RequestBody String statsJson
    ) {
        log.info("Incoming AI statistics analysis request");
        String analysis = chatService.analyzeStatistics(statsJson);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(1000)
                .message("Statistics analyzed successfully")
                .result(analysis)
                .build());
    }
    
    // ==================== HELPER METHODS ====================
    
    private String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.debug("No authenticated user found: {}", e.getMessage());
        }
        return null; // Guest user
    }
    
    // ==================== INNER CLASSES ====================
    
    @lombok.Getter
    @lombok.Setter
    public static class RatingRequest {
        private Integer rating;
        private String feedback;
    }
    
    @lombok.Getter
    @lombok.Setter
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ApiResponse<T> {
        private Integer code;
        private String message;
        private T result;
    }
}
