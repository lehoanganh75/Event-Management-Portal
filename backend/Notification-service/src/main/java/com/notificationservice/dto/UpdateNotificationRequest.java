package com.notificationservice.dto;

import com.notificationservice.entity.NotificationType;
import lombok.Data;

@Data
public class UpdateNotificationRequest {
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
    private Boolean read;
}