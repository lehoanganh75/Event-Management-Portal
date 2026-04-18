package com.notificationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByAccountIdOrderByCreatedAtDesc(String userProfileId);

    List<Notification> findByAccountIdAndIsReadFalse(String userProfileId);

    long countByAccountIdAndIsReadFalse(String userProfileId);

    List<Notification> findByAccountIdAndIsReadFalseOrderByCreatedAtDesc(String userProfileId);

    List<Notification> findByAccountIdAndTypeOrderByCreatedAtDesc(String userProfileId, NotificationType type);

    List<Notification> findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userProfileId, LocalDateTime startDate, LocalDateTime endDate);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.accountId = :userProfileId")
    void deleteByAccountId(@Param("userProfileId") String userProfileId);

    Page<Notification> findByAccountId(String userProfileId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.accountId = :userProfileId ORDER BY n.createdAt DESC")
    List<Notification> findTopNByUserProfileIdOrderByCreatedAtDesc(@Param("userProfileId") String userProfileId, Pageable pageable);

    List<Notification> findByAccountIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String userProfileId, String keyword);

    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.accountId = :userId GROUP BY n.type")
    List<Object[]> countNotificationsByType(@Param("userId") String userId);

    boolean existsByAccountIdAndIsReadFalse(String userProfileId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id IN :ids")
    void markMultipleAsRead(@Param("ids") List<String> ids, @Param("readAt") LocalDateTime readAt);

    void deleteByIdIn(List<String> ids);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    long deleteByCreatedAtBefore(@Param("cutoffDate") LocalDateTime cutoffDate);
}