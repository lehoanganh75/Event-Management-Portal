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
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private UserResponse user;

    public static EventFeedbackResponse from(EventFeedback feedback, UserResponse user) {
        if (feedback == null) return null;
        return EventFeedbackResponse.builder()
                .id(feedback.getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .user(user)
                .build();
    }
}
