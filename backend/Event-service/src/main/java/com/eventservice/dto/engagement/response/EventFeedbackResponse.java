package com.eventservice.dto.engagement.response;

import lombok.*;
import java.time.LocalDateTime;
import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.engagement.EventFeedback;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventFeedbackResponse {
    private String id;
    private String reviewerAccountId;
    private Integer rating;
    private String title;
    private String comment;
    private String ratingReason;
    @com.fasterxml.jackson.annotation.JsonProperty("isAnonymous")
    private boolean isAnonymous;
    private String organizerReply;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private UserResponse user;

    public static EventFeedbackResponse from(EventFeedback feedback, UserResponse user) {
        if (feedback == null)
            return null;
        return EventFeedbackResponse.builder()
                .id(feedback.getId())
                .reviewerAccountId(feedback.isAnonymous() ? "anonymous" : feedback.getReviewerAccountId())
                .rating(feedback.getRating())
                .title(feedback.getTitle())
                .comment(feedback.getComment())
                .ratingReason(feedback.getRatingReason())
                .isAnonymous(feedback.isAnonymous())
                .organizerReply(feedback.getOrganizerReply())
                .repliedAt(feedback.getRepliedAt())
                .createdAt(feedback.getCreatedAt())
                .user(user)
                .build();
    }
}
