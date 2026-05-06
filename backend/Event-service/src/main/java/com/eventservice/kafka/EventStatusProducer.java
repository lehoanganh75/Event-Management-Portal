package com.eventservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventStatusProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendEventStatusChange(String eventId, String oldStatus, String newStatus) {
        log.info("Sending event status change to Kafka: {} ({} -> {})", eventId, oldStatus, newStatus);
        Map<String, String> payload = Map.of(
            "eventId", eventId,
            "oldStatus", oldStatus,
            "newStatus", newStatus
        );
        try {
            kafkaTemplate.send("event-status-topic", payload);
        } catch (Exception e) {
            log.error("Failed to send event status change to Kafka: {}", e.getMessage());
        }
    }
}
