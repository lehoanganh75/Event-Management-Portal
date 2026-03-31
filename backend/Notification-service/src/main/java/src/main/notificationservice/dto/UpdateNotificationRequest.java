package src.main.notificationservice.dto;

import lombok.Data;
import src.main.notificationservice.entity.NotificationType;

@Data
public class UpdateNotificationRequest {
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
    private Boolean read;
}