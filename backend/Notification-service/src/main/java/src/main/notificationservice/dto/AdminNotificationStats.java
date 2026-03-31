package src.main.notificationservice.dto;

import lombok.Builder;
import lombok.Data;
import src.main.notificationservice.entity.NotificationType;

import java.util.Map;

@Data
@Builder
public class AdminNotificationStats {
    private long total;
    private long unread;
    private long read;
    private Map<NotificationType, Long> statsByType;
    private Map<String, Long> statsByDay;
}