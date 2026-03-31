package src.main.notificationservice.dto;

import lombok.Data;
import src.main.notificationservice.entity.NotificationType;
import java.util.List;

@Data
public class AdminSendToUsersRequest {
    private List<String> userIds;
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
}