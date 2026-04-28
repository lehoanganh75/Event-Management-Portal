package com.eventservice.repository;

import com.eventservice.entity.EventSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventSessionRepository extends JpaRepository<EventSession, String> {
    java.util.List<EventSession> findByEventId(String eventId);
}
