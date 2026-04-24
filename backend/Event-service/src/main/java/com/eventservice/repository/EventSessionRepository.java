package com.eventservice.repository;

import com.eventservice.entity.EventSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventSessionRepository extends JpaRepository<EventSession, String> {
}
