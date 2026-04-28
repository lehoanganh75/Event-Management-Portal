package com.identityservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String recipientId;
    private String senderId;
    private String title;
    private String message;
    private String type;
    private String relatedEntityId;
    private String actionUrl;
}
