package com.eventservice.dto.registration.response;

import lombok.*;
import java.time.LocalDateTime;
import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.registration.EventInvitation;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventInvitationResponse {
    private String id;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private UserResponse invitee;
    private UserResponse inviter;
    private String type;
    private String message;
    private String targetRole;

    public static EventInvitationResponse from(EventInvitation invitation, UserResponse invitee, UserResponse inviter) {
        if (invitation == null) return null;
        return EventInvitationResponse.builder()
                .id(invitation.getId())
                .status(invitation.getStatus() != null ? invitation.getStatus().name() : null)
                .type(invitation.getType() != null ? invitation.getType().name() : "ORGANIZER")
                .targetRole(invitation.getTargetRole() != null ? invitation.getTargetRole().name() : null)
                .message(invitation.getMessage())
                .sentAt(invitation.getSentAt())
                .respondedAt(invitation.getRespondedAt())
                .invitee(invitee)
                .inviter(inviter)
                .build();
    }
}
