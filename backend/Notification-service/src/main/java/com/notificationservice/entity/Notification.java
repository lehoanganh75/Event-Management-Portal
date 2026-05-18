package com.notificationservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    private String id;

    @Indexed
    private String accountId;

    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;

    @Indexed(expireAfterSeconds = 2592000) // TTL: Automatically deletes old notifications after 30 days
    private LocalDateTime createdAt;

    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private LocalDateTime readAt;
    private Integer priority;
}