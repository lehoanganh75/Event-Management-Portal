package com.eventservice.repository;

import com.eventservice.entity.core.EventSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventSessionRepository extends JpaRepository<EventSession, String> {
    java.util.List<EventSession> findByEventId(String eventId);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE event_sessions SET is_deleted = 1, updated_at = NOW() WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@org.springframework.data.repository.query.Param("eventId") String eventId);
}
