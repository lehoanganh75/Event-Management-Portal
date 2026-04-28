package com.notificationservice.dto;

import com.notificationservice.entity.NotificationType;
import lombok.Data;

@Data
public class CreateNotificationRequest {
    private String userProfileId;
    private NotificationType type;
    private String title;
    private String message;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private Integer priority;
}