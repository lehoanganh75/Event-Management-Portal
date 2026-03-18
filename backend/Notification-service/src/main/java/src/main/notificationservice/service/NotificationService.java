package src.main.notificationservice.service;

import src.main.notificationservice.entity.Notification;

import java.util.List;

public interface NotificationService {
    // Lấy tất cả thông báo của một người dùng, sắp xếp mới nhất lên đầu
    List<Notification> getNotificationsByUser(String userProfileId);

    // Đánh dấu một thông báo là đã đọc
    void markAsRead(String notificationId);

    // Đánh dấu tất cả thông báo của người dùng là đã đọc
    void markAllAsRead(String userProfileId);

    // Đếm số thông báo chưa đọc để hiển thị Badge trên UI
    long countUnread(String userProfileId);
}
