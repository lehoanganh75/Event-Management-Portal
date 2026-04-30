package com.eventservice.service;

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
import com.eventservice.entity.social.ChatSession;

import java.util.List;

public interface ChatService {
    
    /**
     * Create or resume chat session
     */
    ChatSessionResponse createOrResumeSession(ChatSessionRequest request, String userId);
    
    /**
     * Send message and get AI response
     */
    ChatMessageResponse sendMessage(ChatMessageRequest request, String userId);
    
    /**
     * Get chat session with messages
     */
    ChatSessionResponse getSession(String sessionId, String userId);
    
    /**
     * Get all sessions for user
     */
    List<ChatSessionResponse> getUserSessions(String userId);
    
    /**
     * End chat session
     */
    void endSession(String sessionId, String userId);
    
    /**
     * Rate chat session
     */
    void rateSession(String sessionId, Integer rating, String feedback, String userId);
    
    /**
     * Generate event plan from chat
     */
    EventPlanSuggestionResponse generateEventPlanFromChat(String sessionId, String userId);
    
    /**
     * Get quick reply suggestions
     */
    List<String> getQuickReplies(String sessionId);

    /**
     * Extract event details from raw text using AI
     */
    EventPlanSuggestionResponse extractFromText(String text);
}

