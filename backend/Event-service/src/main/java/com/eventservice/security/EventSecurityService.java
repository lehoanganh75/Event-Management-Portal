package com.eventservice.security;

import com.eventservice.entity.Event;
import com.eventservice.entity.EventUser;
import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.EventUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventSecurityService {

    private final EventUserRepository eventUserRepository;
    private final EventRepository eventRepository;

    /**
     * Checks if a user has at least the required role for an event.
     */
    public void checkPermission(String eventId, String accountId, OrganizerRole minRequiredRole, boolean requireOngoing) {
        // 1. Status Validation
        if (requireOngoing) {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            if (event.getStatus() != EventStatus.ONGOING) {
                throw new RuntimeException("Action forbidden: Event must be ONGOING");
            }
        }

        // 2. Fetch User Role
        EventUser eventUser = eventUserRepository.findByEventIdAndAccountId(eventId, accountId)
                .orElseThrow(() -> new RuntimeException("Forbidden: No role assigned for this event"));

        OrganizerRole userRole = eventUser.getRole();

        // 3. Role Power Comparison (Lower ordinal = More power)
        // ORGANIZER(0), LEADER(1), COORDINATOR(2), MEMBER(3), ADVISOR(4), PARTICIPANT(5)
        if (userRole.ordinal() > minRequiredRole.ordinal()) {
            log.warn("Access Denied: User {} (Role: {}) tried action requiring {}", accountId, userRole, minRequiredRole);
            throw new RuntimeException("Forbidden: Insufficient event role");
        }
    }
}
