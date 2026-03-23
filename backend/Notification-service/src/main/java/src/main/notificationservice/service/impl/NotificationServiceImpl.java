package src.main.notificationservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.notificationservice.dto.*;
import src.main.notificationservice.entity.Notification;
import src.main.notificationservice.entity.NotificationType;
import src.main.notificationservice.repository.NotificationRepository;
import src.main.notificationservice.service.NotificationService;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public List<Notification> getNotificationsByUser(String userProfileId) {
        return notificationRepository.findByUserProfileIdOrderByCreatedAtDesc(userProfileId);
    }

    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    @Override
    public void markAllAsRead(String userProfileId) {
        List<Notification> unread = notificationRepository.findByUserProfileIdAndIsReadFalse(userProfileId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    @Override
    public long countUnread(String userProfileId) {
        return notificationRepository.countByUserProfileIdAndIsReadFalse(userProfileId);
    }

    @Override
    public Notification sendNotification(String userProfileId, NotificationType type, String title, String message) {
        Notification notification = new Notification();
        notification.setUserProfileId(userProfileId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Override
    public void sendBulkNotification(List<String> userIds, NotificationType type, String title, String message) {
        List<Notification> notifications = userIds.stream().map(userId -> {
            Notification notification = new Notification();
            notification.setUserProfileId(userId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            return notification;
        }).collect(Collectors.toList());
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void sendNotificationWithAction(String userProfileId, NotificationType type, String title, String message, String relatedEntityId, String relatedEntityType, String actionUrl) {
        Notification notification = new Notification();
        notification.setUserProfileId(userProfileId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setActionUrl(actionUrl);
        notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUnreadNotifications(String userProfileId) {
        return notificationRepository.findByUserProfileIdAndIsReadFalseOrderByCreatedAtDesc(userProfileId);
    }

    @Override
    public List<Notification> getNotificationsByType(String userProfileId, NotificationType type) {
        return notificationRepository.findByUserProfileIdAndTypeOrderByCreatedAtDesc(userProfileId, type);
    }

    @Override
    public List<Notification> getNotificationsByDateRange(String userProfileId, LocalDateTime startDate, LocalDateTime endDate) {
        return notificationRepository.findByUserProfileIdAndCreatedAtBetweenOrderByCreatedAtDesc(userProfileId, startDate, endDate);
    }

    @Override
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public void deleteAllNotifications(String userProfileId) {
        notificationRepository.deleteByUserProfileId(userProfileId);
    }

    @Override
    public Page<Notification> getNotificationsByUserPaged(String userProfileId, Pageable pageable) {
        return notificationRepository.findByUserProfileId(userProfileId, pageable);
    }

    @Override
    public List<Notification> getRecentNotifications(String userProfileId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return notificationRepository.findByUserProfileId(userProfileId, pageable).getContent();
    }

    @Override
    public List<Notification> searchNotifications(String userProfileId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getNotificationsByUser(userProfileId);
        }
        return notificationRepository.findByUserProfileIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(userProfileId, keyword);
    }

    @Override
    public Map<NotificationType, Long> getNotificationStats(String userProfileId) {
        List<Object[]> results = notificationRepository.countNotificationsByType(userProfileId);
        Map<NotificationType, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            NotificationType type = (NotificationType) result[0];
            Long count = (Long) result[1];
            stats.put(type, count);
        }
        return stats;
    }

    @Override
    public boolean hasUnreadNotifications(String userProfileId) {
        return notificationRepository.existsByUserProfileIdAndIsReadFalse(userProfileId);
    }

    @Override
    public Optional<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    @Override
    public List<NotificationResponse> exportNotifications(String userProfileId) {
        List<Notification> notifications = getNotificationsByUser(userProfileId);
        return notifications.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public void markMultipleAsRead(List<String> notificationIds) {
        if (notificationIds != null && !notificationIds.isEmpty()) {
            notificationRepository.markMultipleAsRead(notificationIds, LocalDateTime.now());
        }
    }

    @Override
    public Notification createNotification(CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserProfileId(request.getUserProfileId());
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRelatedEntityId(request.getRelatedEntityId());
        notification.setRelatedEntityType(request.getRelatedEntityType());
        notification.setActionUrl(request.getActionUrl());
        if (request.getPriority() != null) {
            notification.setPriority(request.getPriority());
        }
        return notificationRepository.save(notification);
    }

    @Override
    public void sendBulkNotification(BulkNotificationRequest request) {
        List<Notification> notifications = request.getUserIds().stream().map(userId -> {
            Notification notification = new Notification();
            notification.setUserProfileId(userId);
            notification.setType(request.getType());
            notification.setTitle(request.getTitle());
            notification.setMessage(request.getMessage());
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRelatedEntityId(request.getRelatedEntityId());
            notification.setRelatedEntityType(request.getRelatedEntityType());
            notification.setActionUrl(request.getActionUrl());
            return notification;
        }).collect(Collectors.toList());
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void sendRealtimeNotification(RealtimeNotificationRequest request) {
        Notification notification = sendNotification(request.getUserProfileId(), request.getType(), request.getTitle(), request.getMessage());
    }

    @Override
    public void deleteMultipleNotifications(List<String> notificationIds) {
        if (notificationIds != null && !notificationIds.isEmpty()) {
            notificationRepository.deleteByIdIn(notificationIds);
        }
    }

    @Override
    public long cleanupOldNotifications(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        return notificationRepository.deleteByCreatedAtBefore(cutoffDate);
    }

    private NotificationResponse convertToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userProfileId(notification.getUserProfileId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(notification.getRelatedEntityType())
                .actionUrl(notification.getActionUrl())
                .build();
    }

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    
}