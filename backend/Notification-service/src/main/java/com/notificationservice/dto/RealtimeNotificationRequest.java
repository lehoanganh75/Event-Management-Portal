package com.notificationservice.dto;

import com.notificationservice.entity.NotificationType;
import lombok.Data;

@Data
public class RealtimeNotificationRequest {
    private String userProfileId;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private boolean sendToAllDevices;
}