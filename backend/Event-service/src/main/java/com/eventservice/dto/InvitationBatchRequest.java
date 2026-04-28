package com.eventservice.dto;

import com.eventservice.entity.enums.OrganizerRole;
import lombok.Data;

import java.util.List;

@Data
public class InvitationBatchRequest {
    private List<String> inviteeIds;
    private OrganizerRole targetRole;
    private String message;
}
