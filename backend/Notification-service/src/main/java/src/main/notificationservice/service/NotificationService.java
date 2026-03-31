package src.main.notificationservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import src.main.notificationservice.dto.*;
import src.main.notificationservice.entity.Notification;
import src.main.notificationservice.entity.NotificationType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface NotificationService {

    List<Notification> getNotificationsByUser(String userProfileId);

    void markAsRead(String notificationId);

    void markAllAsRead(String userProfileId);

    long countUnread(String userProfileId);

    Notification sendNotification(String userProfileId, NotificationType type, String title, String message);

    void sendBulkNotification(List<String> userIds, NotificationType type, String title, String message);

    void sendNotificationWithAction(String userProfileId, NotificationType type, String title, String message, String relatedEntityId, String relatedEntityType, String actionUrl);

    List<Notification> getUnreadNotifications(String userProfileId);

    List<Notification> getNotificationsByType(String userProfileId, NotificationType type);

    List<Notification> getNotificationsByDateRange(String userProfileId, LocalDateTime startDate, LocalDateTime endDate);

    void deleteNotification(String notificationId);

    void deleteAllNotifications(String userProfileId);

    Page<Notification> getNotificationsByUserPaged(String userProfileId, Pageable pageable);

    List<Notification> getRecentNotifications(String userProfileId, int limit);

    List<Notification> searchNotifications(String userProfileId, String keyword);

    Map<NotificationType, Long> getNotificationStats(String userProfileId);

    boolean hasUnreadNotifications(String userProfileId);

    Optional<Notification> getNotificationById(String id);

    List<NotificationResponse> exportNotifications(String userProfileId);

    void markMultipleAsRead(List<String> notificationIds);

    Notification createNotification(CreateNotificationRequest request);

    void sendBulkNotification(BulkNotificationRequest request);

    void sendRealtimeNotification(RealtimeNotificationRequest request);

    void deleteMultipleNotifications(List<String> notificationIds);

    long cleanupOldNotifications(int daysToKeep);


    List<Notification> getAllNotifications();
}