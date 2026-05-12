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
