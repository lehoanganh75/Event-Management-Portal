package com.eventservice.kafka;

import com.eventservice.dto.engagement.NotificationEventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendNotification(NotificationEventDto event) {
        log.info("Sending notification event to Kafka topic 'notification-topic' for recipient: {}", event.getRecipientId());
        log.info("Event content: {}", event);
        try {
            kafkaTemplate.send("notification-topic", event);
            log.info("Successfully sent notification event to Kafka");
        } catch (Exception e) {
            log.error("Failed to send notification event to Kafka: {}", e.getMessage(), e);
        }
    }
}
