package src.main.notificationservice.dto;

import lombok.Data;
import src.main.notificationservice.entity.NotificationType;

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