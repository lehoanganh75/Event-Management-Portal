package com.eventservice.dto.people.response;

import com.eventservice.dto.core.response.EventSessionResponse;
import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.people.EventPresenter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPresenterResponse {
    private String id;
    private LocalDateTime assignedAt;
    private Set<EventSessionResponse> sessions;

    // Composition: Diễn giả nội bộ (Identity Service)
    private UserResponse profile;

    public static EventPresenterResponse from(EventPresenter presenter, UserResponse profile) {
        if (presenter == null)
            return null;
        return EventPresenterResponse.builder()
                .id(presenter.getId())
                .assignedAt(presenter.getAssignedAt())
                .sessions(presenter.getSessions() != null
                        ? presenter.getSessions().stream()
                                .filter(s -> s.getEvent() != null && s.getEvent().getId().equals(presenter.getEvent().getId()))
                                .map(s -> EventSessionResponse.from(s, null))
                                .collect(java.util.stream.Collectors.toSet())
                        : null)
                .profile(profile)
                .build();
    }
}
