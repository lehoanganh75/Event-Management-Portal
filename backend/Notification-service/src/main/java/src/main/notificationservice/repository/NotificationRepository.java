package src.main.notificationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.notificationservice.entity.Notification;
import src.main.notificationservice.entity.NotificationType;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserProfileIdOrderByCreatedAtDesc(String userProfileId);

    List<Notification> findByUserProfileIdAndIsReadFalse(String userProfileId);

    long countByUserProfileIdAndIsReadFalse(String userProfileId);

    List<Notification> findByUserProfileIdAndIsReadFalseOrderByCreatedAtDesc(String userProfileId);

    List<Notification> findByUserProfileIdAndTypeOrderByCreatedAtDesc(String userProfileId, NotificationType type);

    List<Notification> findByUserProfileIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userProfileId, LocalDateTime startDate, LocalDateTime endDate);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userProfileId = :userProfileId")
    void deleteByUserProfileId(@Param("userProfileId") String userProfileId);

    Page<Notification> findByUserProfileId(String userProfileId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.userProfileId = :userProfileId ORDER BY n.createdAt DESC")
    List<Notification> findTopNByUserProfileIdOrderByCreatedAtDesc(@Param("userProfileId") String userProfileId, org.springframework.data.domain.Pageable pageable);

    List<Notification> findByUserProfileIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String userProfileId, String keyword);

    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.userProfileId = :userId GROUP BY n.type")
    List<Object[]> countNotificationsByType(@Param("userId") String userId);

    boolean existsByUserProfileIdAndIsReadFalse(String userProfileId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id IN :ids")
    void markMultipleAsRead(@Param("ids") List<String> ids, @Param("readAt") LocalDateTime readAt);

    void deleteByIdIn(List<String> ids);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    long deleteByCreatedAtBefore(@Param("cutoffDate") LocalDateTime cutoffDate);
}