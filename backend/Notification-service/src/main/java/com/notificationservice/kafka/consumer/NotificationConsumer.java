package com.notificationservice.kafka.consumer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.notificationservice.dto.NotificationEvent;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import com.notificationservice.repository.NotificationRepository;

import java.time.LocalDateTime;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consumeNotification(NotificationEvent event) {
        log.info("#### [KAFKA CONSUMER] Received NotificationEvent: {}", event);
        
        Notification notification = new Notification();
        notification.setAccountId(event.getRecipientId());
        notification.setTitle(event.getTitle());
        notification.setMessage(event.getMessage());
        
        try {
            if (event.getType() != null) {
                notification.setType(NotificationType.valueOf(event.getType()));
            } else {
                notification.setType(NotificationType.SYSTEM);
            }
        } catch (IllegalArgumentException e) {
            log.warn("#### [KAFKA CONSUMER] Type mapping failed for: {}. Falling back to SYSTEM.", event.getType());
            notification.setType(NotificationType.SYSTEM);
        }

        notification.setRelatedEntityId(event.getRelatedEntityId());
        notification.setActionUrl(event.getActionUrl());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        try {
            Notification savedNotification = notificationRepository.save(notification);
            log.info("#### [KAFKA CONSUMER] Notification saved successfully with ID: {} for Account: {}", savedNotification.getId(), savedNotification.getAccountId());
            log.info("#### [KAFKA CONSUMER] Title: {}, Type: {}", savedNotification.getTitle(), savedNotification.getType());

            // Gửi thông báo real-time
            String destination = "/topic/notifications." + savedNotification.getAccountId();
            log.info("#### [KAFKA CONSUMER] Broadcasting to WebSocket: {}", destination);
            messagingTemplate.convertAndSend(destination, savedNotification);
            log.info("#### [KAFKA CONSUMER] Broadcast complete.");
        } catch (Exception e) {
            log.error("#### [KAFKA CONSUMER] Critical error in processing: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "quiz-topic", groupId = "quiz-group")
    public void consumeQuizEvent(com.eventservice.dto.quiz.QuizEvent event) {
        log.info("#### [KAFKA CONSUMER] Received QuizEvent: {}", event);
        String destination = "/topic/quiz." + event.getEventId();
        log.info("#### [KAFKA CONSUMER] Broadcasting Quiz to WebSocket: {}", destination);
        messagingTemplate.convertAndSend(destination, event);
    }
}
