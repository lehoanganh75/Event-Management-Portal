package com.eventservice.service.impl;

import com.eventservice.dto.engagement.QAMessageDto;
import com.eventservice.entity.engagement.QAMessage;
import com.eventservice.repository.QARepository;
import com.eventservice.service.QAService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QAServiceImpl implements QAService {

    private final QARepository qaRepository;
    private final com.eventservice.repository.EventRepository eventRepository;
    private final com.eventservice.repository.EventOrganizerRepository organizerRepository;
    private final com.eventservice.kafka.NotificationProducer notificationProducer;

    @Override
    @Transactional
    public QAMessageDto postMessage(QAMessageDto dto) {
        QAMessage message = QAMessage.builder()
                .eventId(dto.getEventId())
                .senderAccountId(dto.getSenderAccountId())
                .senderName(dto.getSenderName())
                .senderAvatar(dto.getSenderAvatar())
                .content(dto.getContent())
                .build();
        QAMessage saved = qaRepository.save(message);

        // Send real-time and database notifications to event organizers (ban tổ chức)
        try {
            String eventTitle = "Sự kiện";
            var eventOpt = eventRepository.findById(dto.getEventId());
            if (eventOpt.isPresent()) {
                eventTitle = eventOpt.get().getTitle();
            }

            var organizers = organizerRepository.findByEventId(dto.getEventId());
            if (organizers != null && !organizers.isEmpty()) {
                for (var organizer : organizers) {
                    // Tránh tự gửi thông báo cho chính mình nếu người gửi cũng nằm trong ban tổ chức
                    if (organizer.getAccountId() != null && !organizer.getAccountId().equals(dto.getSenderAccountId())) {
                        com.eventservice.dto.engagement.NotificationEventDto notification = 
                            com.eventservice.dto.engagement.NotificationEventDto.builder()
                                .recipientId(organizer.getAccountId())
                                .senderId(dto.getSenderAccountId())
                                .title("Hỏi đáp: Câu hỏi mới")
                                .message(dto.getSenderName() + " đã gửi câu hỏi trong sự kiện \"" + eventTitle + "\": " + dto.getContent())
                                .type("QA_MESSAGE")
                                .relatedEntityId(dto.getEventId())
                                .actionUrl("/lecturer/events/" + dto.getEventId() + "/management?tab=qa")
                                .build();
                        notificationProducer.sendNotification(notification);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send QA message notification: " + e.getMessage());
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public QAMessageDto answerMessage(String messageId, String answerContent, String adminId, String adminName) {
        QAMessage message = qaRepository.findById(messageId).orElseThrow();
        message.setAnswerContent(answerContent);
        message.setAnsweredByAccountId(adminId);
        message.setAnsweredByName(adminName);
        message.setAnswered(true);
        return mapToDto(qaRepository.save(message));
    }

    @Override
    public List<QAMessageDto> getMessagesByEvent(String eventId, boolean includeHidden) {
        List<QAMessage> messages = includeHidden 
                ? qaRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                : qaRepository.findByEventIdAndIsHiddenFalseOrderByCreatedAtDesc(eventId);
        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QAMessageDto upvoteMessage(String messageId) {
        QAMessage message = qaRepository.findById(messageId).orElseThrow();
        message.setUpvotes(message.getUpvotes() + 1);
        return mapToDto(qaRepository.save(message));
    }

    @Override
    @Transactional
    public void deleteMessage(String messageId) {
        qaRepository.deleteById(messageId);
    }

    private QAMessageDto mapToDto(QAMessage entity) {
        return QAMessageDto.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .senderAccountId(entity.getSenderAccountId())
                .senderName(entity.getSenderName())
                .senderAvatar(entity.getSenderAvatar())
                .content(entity.getContent())
                .isAnswered(entity.isAnswered())
                .answerContent(entity.getAnswerContent())
                .answeredByAccountId(entity.getAnsweredByAccountId())
                .answeredByName(entity.getAnsweredByName())
                .createdAt(entity.getCreatedAt())
                .upvotes(entity.getUpvotes())
                .isHidden(entity.isHidden())
                .build();
    }
}
