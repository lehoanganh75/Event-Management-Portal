package com.eventservice.dto.core.response;

import lombok.*;
import java.time.LocalDateTime;
import com.eventservice.entity.core.EventSession;
import com.eventservice.dto.user.UserResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSessionResponse {
    private String id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String room;
    private UserResponse presenter;

    public static EventSessionResponse from(EventSession session, UserResponse presenterProfile) {
        if (session == null)
            return null;
        return EventSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .description(session.getDescription())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .room(session.getRoom())
                .presenter(presenterProfile)
                .build();
    }
}
