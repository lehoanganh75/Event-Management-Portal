package com.eventservice.dto.social.response;

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
import com.eventservice.dto.engagement.quiz.*;
import com.eventservice.dto.engagement.survey.*;

import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.entity.enums.ChatMessageType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private String id;
    private String sessionId;
    private ChatMessageRole role;
    private ChatMessageType type;
    private String content;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private Integer tokensUsed;

    // AI-generated extras returned to frontend
    private List<String> quickReplies;
    private List<EventSuggestionItem> eventSuggestions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EventSuggestionItem {
        private String id;
        private String title;
        private String location;
        private String startTime;
    }
}

