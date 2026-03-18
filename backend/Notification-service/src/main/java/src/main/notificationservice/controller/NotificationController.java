package src.main.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.notificationservice.entity.Notification;
import src.main.notificationservice.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {
    private final NotificationService notificationService;

    // Lấy tất cả thông báo của một người dùng
    @GetMapping("/user/{userProfileId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String userProfileId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userProfileId));
    }

    // Đếm số thông báo chưa đọc để hiển thị trên Badge icon
    @GetMapping("/user/{userProfileId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userProfileId) {
        return ResponseEntity.ok(notificationService.countUnread(userProfileId));
    }

    // Đánh dấu một thông báo cụ thể là đã đọc
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}