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

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<QAMessageDto>> getMessages(@PathVariable String eventId) {
        return ResponseEntity.ok(qaService.getMessagesByEvent(eventId, false));
    }

    @MessageMapping("/qa/{eventId}/send")
    @SendTo("/topic/qa/{eventId}")
    public QAMessageDto sendMessage(@DestinationVariable String eventId, QAMessageDto messageDto) {
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
