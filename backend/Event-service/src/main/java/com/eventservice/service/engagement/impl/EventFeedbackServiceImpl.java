package com.eventservice.service.engagement.impl;

import com.eventservice.dto.engagement.request.EventFeedbackRequest;
import com.eventservice.dto.engagement.response.EventFeedbackResponse;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.engagement.EventFeedback;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.engagement.EventFeedbackRepository;
import com.eventservice.service.engagement.EventFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventFeedbackServiceImpl implements EventFeedbackService {

    private final EventFeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public EventFeedbackResponse submitFeedback(String eventId, EventFeedbackRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventFeedback feedback = EventFeedback.builder()
                .event(event)
                .reviewerAccountId(request.getReviewerAccountId())
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .ratingReason(request.getRatingReason())
                .isAnonymous(request.isAnonymous())
                .build();

        feedback = feedbackRepository.save(feedback);
        return mapToResponse(feedback);
    }

    @Override
    public List<EventFeedbackResponse> getFeedbacksByEvent(String eventId) {
        return feedbackRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventFeedbackResponse replyToFeedback(String feedbackId, String reply) {
        EventFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setOrganizerReply(reply);
        feedback.setRepliedAt(LocalDateTime.now());
        return mapToResponse(feedbackRepository.save(feedback));
    }

    private EventFeedbackResponse mapToResponse(EventFeedback feedback) {
        return EventFeedbackResponse.builder()
                .id(feedback.getId())
                .reviewerAccountId(feedback.getReviewerAccountId())
                .rating(feedback.getRating())
                .title(feedback.getTitle())
                .comment(feedback.getComment())
                .ratingReason(feedback.getRatingReason())
                .isAnonymous(feedback.isAnonymous())
                .organizerReply(feedback.getOrganizerReply())
                .repliedAt(feedback.getRepliedAt())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
