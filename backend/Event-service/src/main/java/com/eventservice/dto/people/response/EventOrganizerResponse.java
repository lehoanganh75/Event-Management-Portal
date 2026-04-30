package com.eventservice.dto.people.response;

import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.entity.enums.OrganizerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventOrganizerResponse {
    private String id;
    private OrganizerRole role;
    private OrganizerStatus status;
    private LocalDateTime assignedAt;

    // Composition: Nhúng trực tiếp profile để dễ mở rộng
    private UserResponse profile;

    public static EventOrganizerResponse from(com.eventservice.entity.people.EventOrganizer organizer,
            UserResponse profile) {
        if (organizer == null)
            return null;
        return EventOrganizerResponse.builder()
                .id(organizer.getId())
                .role(organizer.getRole())
                .status(organizer.getStatus())
                .assignedAt(organizer.getAssignedAt())
                .profile(profile)
                .build();
    }
}
