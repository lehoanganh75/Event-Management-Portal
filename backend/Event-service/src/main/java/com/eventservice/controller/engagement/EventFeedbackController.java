package com.eventservice.controller.engagement;

import com.eventservice.dto.engagement.request.EventFeedbackRequest;
import com.eventservice.dto.engagement.response.EventFeedbackResponse;
import com.eventservice.service.engagement.EventFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class EventFeedbackController {

    private final EventFeedbackService feedbackService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final java.util.concurrent.ConcurrentHashMap<String, Boolean> feedbackStatusMap = new java.util.concurrent.ConcurrentHashMap<>();

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
        return ResponseEntity.ok(feedbackStatusMap.getOrDefault(eventId, false));
    }

    @PostMapping("/event/{eventId}/toggle")
    public ResponseEntity<Boolean> toggleFeedbackStatus(@PathVariable String eventId, @RequestParam(required = false) Boolean status) {
        boolean newStatus = status != null ? status : !feedbackStatusMap.getOrDefault(eventId, false);
        feedbackStatusMap.put(eventId, newStatus);

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
