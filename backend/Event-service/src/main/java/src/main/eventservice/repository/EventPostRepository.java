package src.main.eventservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;

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

    List<EventPost> findByCreatedByAccountId(String accountId);

    // Tìm posts theo accountId và sắp xếp theo thời gian
    List<EventPost> findByCreatedByAccountIdOrderByCreatedAtDesc(String accountId);

    // Tìm posts theo accountId và status
    List<EventPost> findByCreatedByAccountIdAndStatus(String accountId, PostStatus status);

    // Tìm posts theo accountId với điều kiện eventId (nếu cần)
    List<EventPost> findByCreatedByAccountIdAndEventId(String accountId, String eventId);
}