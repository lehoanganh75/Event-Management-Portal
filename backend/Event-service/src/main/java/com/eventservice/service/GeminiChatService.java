package com.eventservice.service;

import com.eventservice.dto.plan.response.EventPlanSuggestionResponse;
import com.eventservice.entity.social.ChatMessage;

import java.util.List;

public interface GeminiChatService {
    
    /**
     * Generate AI response for chat message
     */
    String generateChatResponse(String userMessage, List<ChatMessage> conversationHistory, String contextType);
    
    /**
     * Generate event plan suggestions based on conversation
     */
    EventPlanSuggestionResponse generateEventPlanSuggestion(String userInput, List<ChatMessage> conversationHistory);
    
    /**
     * Analyze user intent from message
     */
    String analyzeUserIntent(String message);
    
    /**
     * Generate quick reply suggestions
     */
    List<String> generateQuickReplies(String lastMessage, String contextType);
    
    /**
     * Check if message is related to event planning
     */
    boolean isEventPlanningRelated(String message);
    
    /**
     * Extract event details from natural language
     */
    EventPlanSuggestionResponse extractEventDetails(String naturalLanguageInput);
}
