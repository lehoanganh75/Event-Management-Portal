package com.notificationservice.kafka.consumer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import com.notificationservice.dto.NotificationEvent;
import com.notificationservice.entity.Notification;
import com.notificationservice.entity.NotificationType;
import com.notificationservice.repository.NotificationRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationConsumer {
    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consumeNotification(NotificationEvent event) {
        System.out.println("Đã nhận thông báo: " + event);
        // Ánh xạ từ DTO sang Entity Notification của bạn
        Notification notification = new Notification();
        notification.setAccountId(event.getRecipientId());
        notification.setTitle(event.getTitle());
        notification.setMessage(event.getMessage());
        notification.setType(NotificationType.valueOf(event.getType()));
        notification.setRelatedEntityId(event.getRelatedEntityId());
        notification.setActionUrl(event.getActionUrl());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        // Lưu xuống MariaDB của Notification Service
        notificationRepository.save(notification);
        System.out.println("Lưu thông báo thành công!");
    }
}
