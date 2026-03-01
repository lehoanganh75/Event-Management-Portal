package src.main.notificationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.notificationservice.entity.Notification;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    // Lấy danh sách thông báo của 1 người dùng, xếp mới nhất lên đầu
    List<Notification> findByUserProfileIdOrderByCreatedAtDesc(String userProfileId);

    // Tìm các thông báo chưa đọc của người dùng
    List<Notification> findByUserProfileIdAndIsReadFalse(String userProfileId);

    // Đếm số lượng thông báo chưa đọc để hiển thị Badge
    long countByUserProfileIdAndIsReadFalse(String userProfileId);
}