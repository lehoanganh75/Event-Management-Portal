package com.eventservice.controller;

import com.eventservice.entity.EventUser;
import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.repository.EventUserRepository;
import com.eventservice.security.RequireEventRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/events/{eventId}/management")
@RequiredArgsConstructor
public class UnifiedEventManagementController {

    private final EventUserRepository eventUserRepository;

    /**
     * MEMBER+ : Scan QR Code for check-in.
     */
    @PostMapping("/check-in")
    @RequireEventRole(value = OrganizerRole.MEMBER, requireOngoing = true)
    public ResponseEntity<?> checkIn(@PathVariable String eventId, @RequestBody Map<String, String> body) {
        String participantId = body.get("participantId");
        
        EventUser participant = eventUserRepository.findByEventIdAndAccountId(eventId, participantId)
                .orElseThrow(() -> new RuntimeException("Participant not registered for this event"));

        if (participant.isCheckedIn()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already checked in"));
        }

        participant.setCheckedIn(true);
        participant.setCheckedInAt(LocalDateTime.now());
        eventUserRepository.save(participant);

        return ResponseEntity.ok(Map.of("status", "SUCCESS", "name", participant.getFullName()));
    }

    /**
     * LEADER+ : Trigger Lucky Draw.
     */
    @PostMapping("/lucky-draw")
    @RequireEventRole(OrganizerRole.LEADER)
    public ResponseEntity<?> triggerLuckyDraw(@PathVariable String eventId) {
        List<EventUser> attendees = eventUserRepository.findByEventIdAndRole(eventId, OrganizerRole.PARTICIPANT)
                .stream().filter(EventUser::isCheckedIn).toList();

        if (attendees.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No attendees available"));
        }

        EventUser winner = attendees.get(new Random().nextInt(attendees.size()));
        return ResponseEntity.ok(winner);
    }

    /**
     * MEMBER+ : View participant list.
     */
    @GetMapping("/participants")
    @RequireEventRole(OrganizerRole.MEMBER)
    public ResponseEntity<List<EventUser>> getParticipants(@PathVariable String eventId) {
        return ResponseEntity.ok(eventUserRepository.findByEventIdAndRole(eventId, OrganizerRole.PARTICIPANT));
    }
}
