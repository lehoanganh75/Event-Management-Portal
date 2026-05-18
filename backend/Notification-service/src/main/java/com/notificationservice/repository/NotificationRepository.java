package com.notificationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByAccountIdOrderByCreatedAtDesc(String userProfileId);

    List<Notification> findByAccountIdAndIsReadFalse(String userProfileId);

    long countByAccountIdAndIsReadFalse(String userProfileId);

    List<Notification> findByAccountIdAndIsReadFalseOrderByCreatedAtDesc(String userProfileId);

    List<Notification> findByAccountIdAndTypeOrderByCreatedAtDesc(String userProfileId, NotificationType type);

    List<Notification> findByAccountIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userProfileId, LocalDateTime startDate, LocalDateTime endDate);

    void deleteByAccountId(String userProfileId);

    Page<Notification> findByAccountId(String userProfileId, Pageable pageable);

    List<Notification> findByAccountIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String userProfileId, String keyword);

    boolean existsByAccountIdAndIsReadFalse(String userProfileId);

    void deleteByIdIn(List<String> ids);
}