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

    @PatchMapping("/{feedbackId}/reply")
    public ResponseEntity<EventFeedbackResponse> replyToFeedback(
            @PathVariable String feedbackId,
            @RequestParam String reply) {
        return ResponseEntity.ok(feedbackService.replyToFeedback(feedbackId, reply));
    }
}
