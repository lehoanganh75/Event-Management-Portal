package com.analyticsservice.kafka;

import com.analyticsservice.service.AISummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventStatusConsumer {

    private final AISummaryService aiSummaryService;

    @KafkaListener(topics = "event-status-topic", groupId = "analytics-group")
    public void handleStatusChange(Map<String, String> message) {
        String eventId = message.get("eventId");
        String newStatus = message.get("newStatus");

        if ("COMPLETED".equals(newStatus)) {
            log.info("Sự kiện {} đã kết thúc. Bắt đầu tổng kết AI...", eventId);
            aiSummaryService.generateSummary(eventId);
        }
    }
}
