package com.eventservice.controller;

import com.eventservice.dto.engagement.QAMessageDto;
import com.eventservice.service.QAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/qa")
@RequiredArgsConstructor
public class QAController {

    private final QAService qaService;
    private final SimpMessagingTemplate messagingTemplate;
    private final java.util.concurrent.ConcurrentHashMap<String, Boolean> qaStatusMap = new java.util.concurrent.ConcurrentHashMap<>();

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<QAMessageDto>> getMessages(@PathVariable String eventId) {
        return ResponseEntity.ok(qaService.getMessagesByEvent(eventId, false));
    }

    @GetMapping("/event/{eventId}/status")
    public ResponseEntity<Boolean> getQAStatus(@PathVariable String eventId) {
        return ResponseEntity.ok(qaStatusMap.getOrDefault(eventId, true));
    }

    @PostMapping("/event/{eventId}/toggle")
    public ResponseEntity<Boolean> toggleQAStatus(@PathVariable String eventId, @RequestParam(required = false) Boolean status) {
        boolean newStatus = status != null ? status : !qaStatusMap.getOrDefault(eventId, true);
        qaStatusMap.put(eventId, newStatus);

        QAMessageDto systemMsg = QAMessageDto.builder()
                .id("SYSTEM_QA_STATUS")
                .eventId(eventId)
                .senderAccountId("SYSTEM")
                .senderName("SYSTEM")
                .content(newStatus ? "QA_STATUS:OPEN" : "QA_STATUS:CLOSED")
                .createdAt(java.time.LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/qa/" + eventId, systemMsg);

        return ResponseEntity.ok(newStatus);
    }

    @MessageMapping("/qa/{eventId}/send")
    @SendTo("/topic/qa/{eventId}")
    public QAMessageDto sendMessage(@DestinationVariable String eventId, QAMessageDto messageDto) {
        // If QA is disabled, reject message
        if (!qaStatusMap.getOrDefault(eventId, true)) {
            throw new IllegalStateException("Q&A session is currently closed.");
        }
        messageDto.setEventId(eventId);
        return qaService.postMessage(messageDto);
    }

    @MessageMapping("/qa/{eventId}/answer")
    @SendTo("/topic/qa/{eventId}")
    public QAMessageDto answerMessage(@DestinationVariable String eventId, QAMessageDto answerDto) {
        return qaService.answerMessage(answerDto.getId(), answerDto.getAnswerContent(), 
                                     answerDto.getAnsweredByAccountId(), answerDto.getAnsweredByName());
    }

    @PostMapping("/{messageId}/upvote")
    public ResponseEntity<Void> upvote(@PathVariable String messageId) {
        QAMessageDto updatedMessage = qaService.upvoteMessage(messageId);
        messagingTemplate.convertAndSend("/topic/qa/" + updatedMessage.getEventId(), updatedMessage);
        return ResponseEntity.ok().build();
    }
}
