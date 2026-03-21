package src.main.notificationservice.dto;

import lombok.Builder;
import lombok.Data;
import src.main.notificationservice.entity.NotificationType;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String userProfileId;
    private NotificationType type;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
}