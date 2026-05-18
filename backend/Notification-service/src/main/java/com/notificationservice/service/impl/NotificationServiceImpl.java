package com.notificationservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import com.notificationservice.dto.*;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import com.notificationservice.repository.NotificationRepository;
import com.notificationservice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    // Cache Helpers
    private String getUnreadCountKey(String accountId) {
        return "notification:unread_count:" + accountId;
    }

    private String getInboxCacheKey(String accountId) {
        return "notification:inbox:" + accountId;
    }

    private void evictCache(String accountId) {
        try {
            redisTemplate.delete(getUnreadCountKey(accountId));
            redisTemplate.delete(getInboxCacheKey(accountId));
            log.debug("Evicted Redis cache keys for user account: {}", accountId);
        } catch (Exception e) {
            log.error("Failed to evict Redis cache for user {}: {}", accountId, e.getMessage());
        }
    }

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
            evictCache(notification.getAccountId());
        });
    }

    @Override
    public void markAllAsRead(String userProfileId) {
        List<Notification> unread = notificationRepository.findByAccountIdAndIsReadFalse(userProfileId);
        if (!unread.isEmpty()) {
            unread.forEach(n -> {
                n.setRead(true);
                n.setReadAt(LocalDateTime.now());
            });
            notificationRepository.saveAll(unread);
            evictCache(userProfileId);
        }
    }

    @Override
    public long countUnread(String userProfileId) {
        String key = getUnreadCountKey(userProfileId);
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("Cache hit for unread count of user: {}", userProfileId);
                return Long.parseLong(cached.toString());
            }
        } catch (Exception e) {
            log.error("Failed to read unread count from Redis: {}", e.getMessage());
        }

        // Cache miss
        long count = notificationRepository.countByAccountIdAndIsReadFalse(userProfileId);
        try {
            redisTemplate.opsForValue().set(key, String.valueOf(count), 1, TimeUnit.HOURS);
            log.debug("Cached unread count ({}) for user: {}", count, userProfileId);
        } catch (Exception e) {
            log.error("Failed to write unread count to Redis: {}", e.getMessage());
        }
        return count;
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
        evictCache(userProfileId);
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
        userIds.forEach(this::evictCache);
    }

    @Override
    public void sendNotificationWithAction(String userProfileId, NotificationType type, String title, String message,
            String relatedEntityId, String relatedEntityType, String actionUrl) {
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
        evictCache(userProfileId);
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
    public List<Notification> getNotificationsByDateRange(String userProfileId, LocalDateTime startDate,
            LocalDateTime endDate) {
        return notificationRepository.findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(userProfileId, startDate,
                endDate);
    }

    @Override
    public void deleteNotification(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notificationRepository.deleteById(notificationId);
            evictCache(notification.getAccountId());
        });
    }

    @Override
    public void deleteAllNotifications(String userProfileId) {
        notificationRepository.deleteByAccountId(userProfileId);
        evictCache(userProfileId);
    }

    @Override
    public Page<Notification> getNotificationsByUserPaged(String userProfileId, Pageable pageable) {
        return notificationRepository.findByAccountId(userProfileId, pageable);
    }

    @Override
    public List<Notification> getRecentNotifications(String userProfileId, int limit) {
        // Cache inboxes if querying standard limit (e.g. 20) to prevent Redis memory
        // bloat
        if (limit == 20) {
            String key = getInboxCacheKey(userProfileId);
            try {
                List<Object> cachedList = redisTemplate.opsForList().range(key, 0, -1);
                if (cachedList != null && !cachedList.isEmpty()) {
                    List<Notification> list = new ArrayList<>();
                    for (Object obj : cachedList) {
                        if (obj instanceof Notification) {
                            list.add((Notification) obj);
                        }
                    }
                    if (!list.isEmpty()) {
                        log.debug("Cache hit for recent inbox of user: {}", userProfileId);
                        return list;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to read inbox cache from Redis: {}", e.getMessage());
            }

            // Cache miss
            Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
            List<Notification> list = notificationRepository.findByAccountId(userProfileId, pageable).getContent();
            try {
                redisTemplate.delete(key);
                if (!list.isEmpty()) {
                    redisTemplate.opsForList().rightPushAll(key, list.toArray());
                    redisTemplate.expire(key, 15, TimeUnit.MINUTES);
                    log.debug("Cached inbox ({} items) for user: {}", list.size(), userProfileId);
                }
            } catch (Exception e) {
                log.error("Failed to write inbox cache to Redis: {}", e.getMessage());
            }
            return list;
        }

        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return notificationRepository.findByAccountId(userProfileId, pageable).getContent();
    }

    @Override
    public List<Notification> searchNotifications(String userProfileId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getNotificationsByUser(userProfileId);
        }
        return notificationRepository.findByAccountIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(userProfileId,
                keyword);
    }

    @Override
    public Map<NotificationType, Long> getNotificationStats(String userProfileId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("accountId").is(userProfileId)),
                Aggregation.group("type").count().as("count"));

        AggregationResults<org.bson.Document> results = mongoTemplate.aggregate(aggregation, "notifications",
                org.bson.Document.class);

        Map<NotificationType, Long> stats = new HashMap<>();
        // Initialize all notification types to 0L count
        for (NotificationType type : NotificationType.values()) {
            stats.put(type, 0L);
        }

        for (org.bson.Document doc : results.getMappedResults()) {
            String typeStr = doc.getString("_id");
            if (typeStr != null) {
                try {
                    NotificationType type = NotificationType.valueOf(typeStr);
                    Long count = doc.get("count", Number.class).longValue();
                    stats.put(type, count);
                } catch (IllegalArgumentException e) {
                    log.warn("Unknown notification type found in stats aggregation: {}", typeStr);
                }
            }
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
            // Find distinct users to invalidate their caches
            Query findQuery = new Query(Criteria.where("id").in(notificationIds));
            List<Notification> notifications = mongoTemplate.find(findQuery, Notification.class);

            // Perform batch update in Mongo
            Update update = new Update().set("isRead", true).set("readAt", LocalDateTime.now());
            mongoTemplate.updateMulti(findQuery, update, Notification.class);

            // Invalidate Redis caches
            notifications.stream()
                    .map(Notification::getAccountId)
                    .distinct()
                    .forEach(this::evictCache);
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
        evictCache(request.getUserProfileId());
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
        request.getUserIds().forEach(this::evictCache);
    }

    @Override
    public void sendRealtimeNotification(RealtimeNotificationRequest request) {
        sendNotification(request.getUserProfileId(), request.getType(), request.getTitle(), request.getMessage());
    }

    @Override
    public void deleteMultipleNotifications(List<String> notificationIds) {
        if (notificationIds != null && !notificationIds.isEmpty()) {
            Query findQuery = new Query(Criteria.where("id").in(notificationIds));
            List<Notification> notifications = mongoTemplate.find(findQuery, Notification.class);

            notificationRepository.deleteByIdIn(notificationIds);

            notifications.stream()
                    .map(Notification::getAccountId)
                    .distinct()
                    .forEach(this::evictCache);
        }
    }

    @Override
    public long cleanupOldNotifications(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        Query query = new Query(Criteria.where("createdAt").lt(cutoffDate));

        List<Notification> deletedNotifications = mongoTemplate.find(query, Notification.class);
        long deletedCount = mongoTemplate.remove(query, Notification.class).getDeletedCount();

        deletedNotifications.stream()
                .map(Notification::getAccountId)
                .distinct()
                .forEach(this::evictCache);

        return deletedCount;
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
            log.info("Broadcasting real-time notification to topic: /topic/notifications.{}",
                    notification.getAccountId());
            messagingTemplate.convertAndSend(
                    "/topic/notifications." + notification.getAccountId(),
                    notification);
        } catch (Exception e) {
            log.error("Failed to broadcast real-time notification: {}", e.getMessage());
        }
    }
}