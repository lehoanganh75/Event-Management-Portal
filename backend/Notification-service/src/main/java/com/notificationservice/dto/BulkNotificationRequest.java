package com.notificationservice.dto;

import com.notificationservice.entity.NotificationType;
import lombok.Data;

import java.util.List;

@Data
public class BulkNotificationRequest {
    private List<String> userIds;
    private NotificationType type;
    private String title;
    private String message;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
}