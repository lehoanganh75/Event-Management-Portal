package com.eventservice.controller.engagement;

import com.eventservice.dto.engagement.request.EventFeedbackRequest;
import com.eventservice.dto.engagement.response.EventFeedbackResponse;
import com.eventservice.entity.core.Event;
import com.eventservice.repository.EventRepository;
import com.eventservice.service.engagement.EventFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class EventFeedbackController {

    private final EventFeedbackService feedbackService;
    private final EventRepository eventRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @PostMapping("/event/{eventId}")
    public ResponseEntity<EventFeedbackResponse> submitFeedback(
            @PathVariable String eventId,
            @RequestBody EventFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.submitFeedback(eventId, request));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventFeedbackResponse>> getEventFeedbacks(@PathVariable String eventId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByEvent(eventId));
    }

    @GetMapping("/event/{eventId}/status")
    public ResponseEntity<Boolean> getFeedbackStatus(@PathVariable String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));
        return ResponseEntity.ok(event.isFeedbackEnabled());
    }

    @PostMapping("/event/{eventId}/toggle")
    public ResponseEntity<Boolean> toggleFeedbackStatus(
            @PathVariable String eventId,
            @RequestParam(required = false) Boolean status) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        boolean newStatus = status != null ? status : !event.isFeedbackEnabled();
        event.setFeedbackEnabled(newStatus);
        eventRepository.save(event);

        // Broadcast via WebSocket so open clients update in real-time
        EventFeedbackResponse systemMsg = EventFeedbackResponse.builder()
                .id("SYSTEM_FEEDBACK_STATUS")
                .comment(newStatus ? "FEEDBACK_STATUS:OPEN" : "FEEDBACK_STATUS:CLOSED")
                .createdAt(java.time.LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/feedback/" + eventId, systemMsg);

        return ResponseEntity.ok(newStatus);
    }

    @PatchMapping("/{feedbackId}/reply")
    public ResponseEntity<EventFeedbackResponse> replyToFeedback(
            @PathVariable String feedbackId,
            @RequestParam String reply) {
        return ResponseEntity.ok(feedbackService.replyToFeedback(feedbackId, reply));
    }
}
