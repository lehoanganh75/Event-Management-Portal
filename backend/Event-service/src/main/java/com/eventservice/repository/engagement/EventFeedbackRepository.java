package com.eventservice.repository.engagement;

import com.eventservice.entity.engagement.EventFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventFeedbackRepository extends JpaRepository<EventFeedback, String> {
    List<EventFeedback> findByEventIdOrderByCreatedAtDesc(String eventId);
}
