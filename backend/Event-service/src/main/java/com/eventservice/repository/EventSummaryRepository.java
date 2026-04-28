package com.eventservice.repository;

import com.eventservice.entity.EventSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventSummaryRepository extends JpaRepository<EventSummary, String> {
    Optional<EventSummary> findByEventId(String eventId);
}
