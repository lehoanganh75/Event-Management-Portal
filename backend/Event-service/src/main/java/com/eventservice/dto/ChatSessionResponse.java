package com.eventservice.dto;

import com.eventservice.entity.enums.ChatSessionStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionResponse {
    
    private String id;
    private String sessionId;
    private String userId;
    private String guestName;
    private String guestEmail;
    private ChatSessionStatus status;
    private String contextType;
    private String contextId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime endedAt;
    private List<ChatMessageResponse> messages;
    private Integer satisfactionRating;
    private String feedback;
}
