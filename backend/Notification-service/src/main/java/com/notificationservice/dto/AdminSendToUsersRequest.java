package com.notificationservice.dto;

import com.notificationservice.entity.NotificationType;
import lombok.Data;
import java.util.List;

@Data
public class AdminSendToUsersRequest {
    private List<String> userIds;
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
}