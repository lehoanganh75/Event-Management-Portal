package com.eventservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.social.EventPost;
import com.eventservice.entity.enums.PostStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventPostRepository extends JpaRepository<EventPost, String> {

    @Query("SELECT p FROM EventPost p WHERE " +
            "(:title IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:status IS NULL OR p.status = :status) AND " +
            "p.isDeleted = false")
    Page<EventPost> findAllWithFilters(@Param("title") String title,
                                       @Param("status") PostStatus status,
                                       Pageable pageable);

    Optional<EventPost> findByIdAndIsDeletedFalse(String id);

    // Tìm posts theo accountId và sắp xếp theo thời gian
    List<EventPost> findByAuthorAccountIdOrderByCreatedAtDesc(String accountId);

    // Tìm posts theo accountId với điều kiện eventId (nếu cần)
    List<EventPost> findByAuthorAccountIdAndEventId(String authorAccountId, String eventId);

    List<EventPost> findByEventIdAndIsDeletedFalseOrderByIsPinnedDescPublishedAtDesc(String eventId);

    List<EventPost> findByEventIdAndIsDeletedFalse(String eventId);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE event_posts SET is_deleted = 1, updated_at = NOW() WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@Param("eventId") String eventId);
}
