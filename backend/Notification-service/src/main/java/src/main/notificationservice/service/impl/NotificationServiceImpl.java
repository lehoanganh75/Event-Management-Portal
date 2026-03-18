package src.main.notificationservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.notificationservice.entity.Notification;
import src.main.notificationservice.repository.NotificationRepository;
import src.main.notificationservice.service.NotificationService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    // Lấy tất cả thông báo của một người dùng, sắp xếp mới nhất lên đầu
    @Override
    public List<Notification> getNotificationsByUser(String userProfileId) {
        return notificationRepository.findByUserProfileIdOrderByCreatedAtDesc(userProfileId);
    }

    // Đánh dấu một thông báo là đã đọc
    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    // Đánh dấu tất cả thông báo của người dùng là đã đọc
    @Override
    public void markAllAsRead(String userProfileId) {
        List<Notification> unread = notificationRepository.findByUserProfileIdAndIsReadFalse(userProfileId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // Đếm số thông báo chưa đọc để hiển thị Badge trên UI
    @Override
    public long countUnread(String userProfileId) {
        return notificationRepository.countByUserProfileIdAndIsReadFalse(userProfileId);
    }
}