package com.notificationservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.notificationservice.dto.*;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import com.notificationservice.repository.NotificationRepository;
import com.notificationservice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<Notification> getNotificationsByUser(String userProfileId) {
        return notificationRepository.findByAccountIdOrderByCreatedAtDesc(userProfileId);
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
        List<Notification> unread = notificationRepository.findByAccountIdAndIsReadFalse(userProfileId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    @Override
    public long countUnread(String userProfileId) {
        return notificationRepository.countByAccountIdAndIsReadFalse(userProfileId);
    }

    @Override
    public Notification sendNotification(String userProfileId, NotificationType type, String title, String message) {
        Notification notification = new Notification();
        notification.setAccountId(userProfileId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);
        broadcastNotification(saved);
        return saved;
    }

    @Override
    public void sendBulkNotification(List<String> userIds, NotificationType type, String title, String message) {
        List<Notification> notifications = userIds.stream().map(userId -> {
            Notification notification = new Notification();
            notification.setAccountId(userId);
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
        notification.setAccountId(userProfileId);
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
        return notificationRepository.findByAccountIdAndIsReadFalseOrderByCreatedAtDesc(userProfileId);
    }

    @Override
    public List<Notification> getNotificationsByType(String userProfileId, NotificationType type) {
        return notificationRepository.findByAccountIdAndTypeOrderByCreatedAtDesc(userProfileId, type);
    }

    @Override
    public List<Notification> getNotificationsByDateRange(String userProfileId, LocalDateTime startDate, LocalDateTime endDate) {
        return notificationRepository.findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(userProfileId, startDate, endDate);
    }

    @Override
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public void deleteAllNotifications(String userProfileId) {
        notificationRepository.deleteByAccountId(userProfileId);
    }

    @Override
    public Page<Notification> getNotificationsByUserPaged(String userProfileId, Pageable pageable) {
        return notificationRepository.findByAccountId(userProfileId, pageable);
    }

    @Override
    public List<Notification> getRecentNotifications(String userProfileId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return notificationRepository.findByAccountId(userProfileId, pageable).getContent();
    }

    @Override
    public List<Notification> searchNotifications(String userProfileId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getNotificationsByUser(userProfileId);
        }
        return notificationRepository.findByAccountIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(userProfileId, keyword);
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
        return notificationRepository.existsByAccountIdAndIsReadFalse(userProfileId);
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
        notification.setAccountId(request.getUserProfileId());
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
        Notification saved = notificationRepository.save(notification);
        broadcastNotification(saved);
        return saved;
    }

    @Override
    public void sendBulkNotification(BulkNotificationRequest request) {
        List<Notification> notifications = request.getUserIds().stream().map(userId -> {
            Notification notification = new Notification();
            notification.setAccountId(userId);
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
                .userProfileId(notification.getAccountId())
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

    
    private void broadcastNotification(Notification notification) {
        try {
            log.info("Broadcasting real-time notification to topic: /topic/notifications.{}", notification.getAccountId());
            messagingTemplate.convertAndSend(
                "/topic/notifications." + notification.getAccountId(), 
                notification
            );
        } catch (Exception e) {
            log.error("Failed to broadcast real-time notification: {}", e.getMessage());
        }
    }
}