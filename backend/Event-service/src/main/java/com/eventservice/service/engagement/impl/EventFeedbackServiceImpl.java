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
    private final com.eventservice.client.IdentityServiceClient identityServiceClient;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

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

        com.eventservice.dto.user.UserResponse user = null;
        if (!feedback.isAnonymous()) {
            try {
                user = identityServiceClient.getUsersById(feedback.getReviewerAccountId());
            } catch (Exception e) {
                // Ignore
            }
        }

        EventFeedbackResponse response = EventFeedbackResponse.from(feedback, user);

        // Broadcast to WebSocket
        messagingTemplate.convertAndSend("/topic/feedback/" + eventId, response);

        return response;
    }

    @Override
    public List<EventFeedbackResponse> getFeedbacksByEvent(String eventId) {
        List<EventFeedback> feedbacks = feedbackRepository.findByEventIdOrderByCreatedAtDesc(eventId);
        if (feedbacks.isEmpty())
            return java.util.List.of();

        java.util.List<String> userIds = feedbacks.stream()
                .filter(f -> !f.isAnonymous())
                .map(EventFeedback::getReviewerAccountId)
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<String, com.eventservice.dto.user.UserResponse> userMap = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            try {
                java.util.List<com.eventservice.dto.user.UserResponse> users = identityServiceClient
                        .getUsersByIds(userIds);
                if (users != null) {
                    userMap = users.stream()
                            .collect(Collectors.toMap(com.eventservice.dto.user.UserResponse::getId, u -> u));
                }
            } catch (Exception e) {
                // Ignore
            }
        }

        java.util.Map<String, com.eventservice.dto.user.UserResponse> finalUserMap = userMap;
        return feedbacks.stream()
                .map(f -> {
                    com.eventservice.dto.user.UserResponse user = f.isAnonymous() ? null
                            : finalUserMap.get(f.getReviewerAccountId());
                    return EventFeedbackResponse.from(f, user);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventFeedbackResponse replyToFeedback(String feedbackId, String reply) {
        EventFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setOrganizerReply(reply);
        feedback.setRepliedAt(LocalDateTime.now());
        feedback = feedbackRepository.save(feedback);

        com.eventservice.dto.user.UserResponse user = null;
        if (!feedback.isAnonymous()) {
            try {
                user = identityServiceClient.getUsersById(feedback.getReviewerAccountId());
            } catch (Exception e) {
                // Ignore
            }
        }

        EventFeedbackResponse response = EventFeedbackResponse.from(feedback, user);
        
        // Broadcast update
        String eventId = feedback.getEvent().getId();
        System.out.println("Broadcasting feedback update to: /topic/feedback/" + eventId);
        messagingTemplate.convertAndSend("/topic/feedback/" + eventId, response);
        
        return response;
    }

    private EventFeedbackResponse mapToResponse(EventFeedback feedback) {
        return EventFeedbackResponse.from(feedback, null);
    }
}
