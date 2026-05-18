package com.notificationservice.kafka.consumer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.notificationservice.dto.CreateNotificationRequest;
import com.notificationservice.dto.NotificationEvent;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import com.notificationservice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group-v5")
    public void consumeNotification(NotificationEvent event) {
        log.info("#### [KAFKA CONSUMER] Received NotificationEvent: {}", event);
        
        CreateNotificationRequest request = new CreateNotificationRequest();
        request.setUserProfileId(event.getRecipientId());
        request.setTitle(event.getTitle());
        request.setMessage(event.getMessage());
        
        NotificationType type = NotificationType.SYSTEM;
        try {
            if (event.getType() != null) {
                type = NotificationType.valueOf(event.getType());
            }
        } catch (IllegalArgumentException e) {
            log.warn("#### [KAFKA CONSUMER] Type mapping failed for: {}. Falling back to SYSTEM.", event.getType());
        }
        request.setType(type);
        request.setRelatedEntityId(event.getRelatedEntityId());
        request.setActionUrl(event.getActionUrl());
        
        try {
            Notification savedNotification = notificationService.createNotification(request);
            log.info("#### [KAFKA CONSUMER] Notification processed and saved successfully: {} for Account: {}", savedNotification.getId(), savedNotification.getAccountId());
        } catch (Exception e) {
            log.error("#### [KAFKA CONSUMER] Critical error in processing Kafka NotificationEvent: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "quiz-topic", groupId = "quiz-group")
    public void consumeQuizEvent(com.eventservice.dto.engagement.quiz.QuizEvent event) {
        log.info("#### [KAFKA CONSUMER] Received QuizEvent: {}", event);
        String destination = "/topic/quiz." + event.getEventId();
        log.info("#### [KAFKA CONSUMER] Broadcasting Quiz to WebSocket: {}", destination);
        messagingTemplate.convertAndSend(destination, event);
    }
}
