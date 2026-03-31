package src.main.notificationservice.dto;

import lombok.Data;
import src.main.notificationservice.entity.NotificationType;

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