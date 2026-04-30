package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.people.EventPresenter;

import java.util.List;

@Repository
public interface EventPresenterRepository extends JpaRepository<EventPresenter, String> {

    List<EventPresenter> findByEventId(String eventId);

    // List<EventPresenter> findByEventIdOrderByOrderIndexAsc(String eventId);

    List<EventPresenter> findByEventIdAndSessions_Id(String eventId, String sessionId);

    // Optional<EventPresenter> findByEventIdAndEmail(String eventId, String email);

    // boolean existsByEventIdAndEmail(String eventId, String email);

    void deleteByEventId(String eventId);

    boolean existsByEventIdAndPresenterAccountId(String eventId, String accountId);

    java.util.Optional<EventPresenter> findByEventIdAndPresenterAccountId(String eventId, String accountId);

    java.util.Optional<EventPresenter> findFirstByEventIdAndPresenterAccountId(String eventId, String accountId);

    @org.springframework.data.jpa.repository.Query("""
                SELECT ep FROM EventPresenter ep
                JOIN ep.event e
                WHERE ep.presenterAccountId = :userId
                AND ep.isDeleted = false
                AND e.isDeleted = false
                AND e.startTime < :endTime
                AND e.endTime > :startTime
                AND e.id != :excludeEventId
            """)
    List<EventPresenter> findConflictingPresenters(
            @org.springframework.data.repository.query.Param("userId") String userId,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime,
            @org.springframework.data.repository.query.Param("excludeEventId") String excludeEventId);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE event_presenters SET is_deleted = 1, status = 'CANCELLED' WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@org.springframework.data.repository.query.Param("eventId") String eventId);
}
