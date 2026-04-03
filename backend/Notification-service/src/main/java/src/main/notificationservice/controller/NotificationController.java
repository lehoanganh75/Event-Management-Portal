package src.main.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.notificationservice.dto.*;
import src.main.notificationservice.entity.Notification;
import src.main.notificationservice.entity.NotificationType;
import src.main.notificationservice.service.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userProfileId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String userProfileId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userProfileId));
    }

    @GetMapping("/user/{userProfileId}/paged")
    public ResponseEntity<Page<Notification>> getNotificationsPaged(
            @PathVariable String userProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(notificationService.getNotificationsByUserPaged(userProfileId, pageable));
    }

    @GetMapping("/user/{userProfileId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String userProfileId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userProfileId));
    }

    @GetMapping("/user/{userProfileId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userProfileId) {
        return ResponseEntity.ok(notificationService.countUnread(userProfileId));
    }

    @GetMapping("/user/{userProfileId}/type/{type}")
    public ResponseEntity<List<Notification>> getNotificationsByType(
            @PathVariable String userProfileId,
            @PathVariable NotificationType type) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(userProfileId, type));
    }

    @GetMapping("/user/{userProfileId}/date-range")
    public ResponseEntity<List<Notification>> getNotificationsByDateRange(
            @PathVariable String userProfileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(notificationService.getNotificationsByDateRange(userProfileId, startDate, endDate));
    }

    @GetMapping("/user/{userProfileId}/recent")
    public ResponseEntity<List<Notification>> getRecentNotifications(
            @PathVariable String userProfileId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(notificationService.getRecentNotifications(userProfileId, limit));
    }

    @GetMapping("/user/{userProfileId}/search")
    public ResponseEntity<List<Notification>> searchNotifications(
            @PathVariable String userProfileId,
            @RequestParam String keyword) {
        return ResponseEntity.ok(notificationService.searchNotifications(userProfileId, keyword));
    }

    @GetMapping("/user/{userProfileId}/stats")
    public ResponseEntity<NotificationStatsResponse> getNotificationStats(@PathVariable String userProfileId) {
        Map<NotificationType, Long> stats = notificationService.getNotificationStats(userProfileId);
        long total = stats.values().stream().mapToLong(Long::longValue).sum();
        long unread = notificationService.countUnread(userProfileId);
        NotificationStatsResponse response = NotificationStatsResponse.builder()
                .total(total)
                .unread(unread)
                .read(total - unread)
                .statsByType(stats)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userProfileId}/has-unread")
    public ResponseEntity<Boolean> hasUnreadNotifications(@PathVariable String userProfileId) {
        return ResponseEntity.ok(notificationService.hasUnreadNotifications(userProfileId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable String id) {
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userProfileId}/export")
    public ResponseEntity<List<NotificationResponse>> exportNotifications(@PathVariable String userProfileId) {
        List<NotificationResponse> exportData = notificationService.exportNotifications(userProfileId);
        return ResponseEntity.ok(exportData);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-batch")
    public ResponseEntity<Void> markMultipleAsRead(@RequestBody List<String> notificationIds) {
        notificationService.markMultipleAsRead(notificationIds);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/user/{userProfileId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userProfileId) {
        notificationService.markAllAsRead(userProfileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody CreateNotificationRequest request) {
        Notification notification = notificationService.createNotification(request);
        return ResponseEntity.ok(notification);
    }

    @PostMapping("/bulk")
    public ResponseEntity<Void> sendBulkNotification(@RequestBody BulkNotificationRequest request) {
        notificationService.sendBulkNotification(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/realtime")
    public ResponseEntity<Void> sendRealtimeNotification(@RequestBody RealtimeNotificationRequest request) {
        notificationService.sendRealtimeNotification(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Void> deleteMultipleNotifications(@RequestBody List<String> notificationIds) {
        notificationService.deleteMultipleNotifications(notificationIds);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userProfileId}")
    public ResponseEntity<Void> deleteAllNotifications(@PathVariable String userProfileId) {
        notificationService.deleteAllNotifications(userProfileId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Long> cleanupOldNotifications(@RequestParam(defaultValue = "30") int daysToKeep) {
        long deletedCount = notificationService.cleanupOldNotifications(daysToKeep);
        return ResponseEntity.ok(deletedCount);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }
}