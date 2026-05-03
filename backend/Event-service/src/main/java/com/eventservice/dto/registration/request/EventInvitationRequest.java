package com.eventservice.dto.registration.request;

import com.eventservice.entity.enums.OrganizerRole;
import lombok.Data;

import java.util.List;

@Data
public class EventInvitationRequest {
    private List<String> inviteeIds;
    private OrganizerRole targetRole;
    private String message;
}
