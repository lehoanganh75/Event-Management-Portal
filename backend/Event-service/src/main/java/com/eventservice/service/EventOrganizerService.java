package com.eventservice.service;

import org.springframework.transaction.annotation.Transactional;
import com.eventservice.entity.EventOrganizer;
import com.eventservice.entity.enums.OrganizerRole;

import java.util.List;

public interface EventOrganizerService {
    @Transactional
    EventOrganizer addOrganizer(String eventId, EventOrganizer organizer);

    List<EventOrganizer> getOrganizers(String eventId);

    @Transactional
    void removeOrganizer(String organizerId);

    @Transactional
    EventOrganizer updateOrganizerRole(String organizerId, OrganizerRole role);

    @Transactional
    void requestToLeave(String eventId, String accountId);

    @Transactional
    void approveLeaveRequest(String organizerId, String approverAccountId);

    @Transactional
    void rejectLeaveRequest(String organizerId, String approverAccountId);
}
