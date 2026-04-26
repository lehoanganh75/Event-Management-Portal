package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.EventPresenter;

import java.util.List;

@Repository
public interface EventPresenterRepository extends JpaRepository<EventPresenter, String> {

    List<EventPresenter> findByEventId(String eventId);

//    List<EventPresenter> findByEventIdOrderByOrderIndexAsc(String eventId);

    List<EventPresenter> findByEventIdAndSessions_Id(String eventId, String sessionId);

    // Optional<EventPresenter> findByEventIdAndEmail(String eventId, String email);

    // boolean existsByEventIdAndEmail(String eventId, String email);

    void deleteByEventId(String eventId);

    boolean existsByEventIdAndEmail(String eventId, String email);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE event_presenters SET is_deleted = 1 WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@org.springframework.data.repository.query.Param("eventId") String eventId);
}