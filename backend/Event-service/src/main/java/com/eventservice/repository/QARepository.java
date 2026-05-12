package com.eventservice.repository;

import com.eventservice.entity.engagement.QAMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QARepository extends JpaRepository<QAMessage, String> {
    List<QAMessage> findByEventIdOrderByCreatedAtDesc(String eventId);
    List<QAMessage> findByEventIdAndIsHiddenFalseOrderByCreatedAtDesc(String eventId);
}
