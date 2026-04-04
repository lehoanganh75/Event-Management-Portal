package com.eventservice.controller;

import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.entity.enums.ParticipationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.eventservice.dto.PlanCreateRequest;
import com.eventservice.dto.PlanResponseDto;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventOrganizer;
import com.eventservice.entity.EventParticipant;
import com.eventservice.entity.EventPresenter;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.EventType;
import com.eventservice.service.EventOrganizerService;
import com.eventservice.service.EventParticipantService;
import com.eventservice.service.EventPresenterService;
import com.eventservice.service.EventService;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {
    private final EventService eventService;
    private final EventPresenterService presenterService;
    private final EventParticipantService participantService;
    private final EventOrganizerService organizerService;

    // 1. Dành cho Sinh viên/Người dùng (Chỉ lấy sự kiện chưa xóa)
    @GetMapping
    public ResponseEntity<List<Event>> getAllActiveEvents() {
        return ResponseEntity.ok(eventService.findAllActive());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Event>> getFeaturedEvents() {
        return ResponseEntity.ok(eventService.getFeaturedEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Event>> getEventByIdForUser(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<Optional<Event>> getEventByIdForAdmin(@PathVariable String id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<Event>> getMyEvents(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(eventService.getEventsByAccountId(accountId));
    }

    @GetMapping("/my-events/this-month")
    public ResponseEntity<List<Event>> getMyEventsThisMonth(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(eventService.getMyEventsByAccountAndMonth(accountId));
    }

    @GetMapping("/by-statuses")
    public ResponseEntity<List<Event>> getEventsByStatuses(@RequestParam List<String> statuses) {
        return ResponseEntity.ok(eventService.getEventsByStatuses(statuses));
    }

    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponseDto>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlansEnriched());
    }

    @GetMapping("/plans/my")
    public ResponseEntity<List<PlanResponseDto>> getMyPlans(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(eventService.getPlansByAccountId(accountId));
    }

    @GetMapping("/plans/status/{statusName}")
    public ResponseEntity<List<PlanResponseDto>> getPlansByStatus(
            @PathVariable String statusName,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        try {
            EventStatus status = Arrays.stream(EventStatus.values())
                    .filter(s -> s.name().equalsIgnoreCase(statusName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Invalid status: " + statusName));

            if (!isPlanStatus(status)) {
                return ResponseEntity.badRequest().build();
            }

            List<PlanResponseDto> plans = eventService.getPlansByAccountId(accountId)
                    .stream()
                    .filter(p -> p.getStatus().equals(status.name()))
                    .collect(Collectors.toList());

            for (PlanResponseDto plan : plans) {
                log.info("Plan {} - targetObjects: {}", plan.getId(), plan.getTargetObjects());
                log.info("Plan {} - presentersList: {}", plan.getId(), plan.getPresentersList());
                log.info("Plan {} - organizersList: {}", plan.getId(), plan.getOrganizersList());
                log.info("Plan {} - participantsList: {}", plan.getId(), plan.getParticipantsList());
            }

            return ResponseEntity.ok(plans);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@Valid @RequestBody PlanCreateRequest request) {
        try {
            Event event = new Event();

            EventOrganizer eventOrganizer = new EventOrganizer();
            eventOrganizer.setFullName(request.getOrganizationId());

            String title = request.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = request.getEventTopic();
            }
            event.setTitle(title);

            event.setDescription(request.getDescription());
            event.setEventTopic(request.getEventTopic());
            event.setLocation(request.getLocation());
            event.setEventMode(request.getEventMode());
            event.setType(EventType.valueOf(request.getType()));
            event.setStartTime(request.getStartTime());
            event.setEndTime(request.getEndTime());
            event.setRegistrationDeadline(request.getRegistrationDeadline());
            event.setMaxParticipants(request.getMaxParticipants());
            event.setFinalized(request.isFinalized());
            event.setArchived(request.isArchived());
            event.setRecipients(request.getRecipients());
            event.setNotes(request.getNotes());
            event.setCustomFieldsJson(request.getCustomFieldsJson());
            event.setCreatedByAccountId(request.getCreatedByAccountId());
            event.setTargetObjects(request.getTargetObjects());

//            if (request.getPresenters() != null) {
//                log.info("Converting {} presenters", request.getPresenters().size());
//                List<EventPresenter> presenters = request.getPresenters().stream()
//                        .map(dto -> {
//                            EventPresenter p = new EventPresenter();
//                            p.setFullName(dto.getFullName());
//                            p.setEmail(dto.getEmail());
//                            p.setPosition(dto.getPosition());
//                            p.setDepartment(dto.getDepartment());
//                            p.setSession(dto.getSession());
//                            return p;
//                        })
//                        .collect(Collectors.toList());
//                event.setPresenters(presenters);
//            }

//            if (request.getOrganizers() != null) {
//                log.info("Converting {} organizers", request.getOrganizers().size());
//                List<EventOrganizer> organizers = request.getOrganizers().stream()
//                        .map(dto -> {
//                            EventOrganizer o = new EventOrganizer();
//                            o.setFullName(dto.getFullName());
//                            o.setEmail(dto.getEmail());
//                            o.setPosition(dto.getPosition());
//                            o.setRole(dto.getRole());
//                            return o;
//                        })
//                        .collect(Collectors.toList());
//                event.setOrganizers(organizers);
//            }

//            if (request.getParticipants() != null) {
//                log.info("Converting {} participants", request.getParticipants().size());
//                List<EventParticipant> participants = request.getParticipants().stream()
//                        .map(dto -> {
//                            EventParticipant p = new EventParticipant();
//                            p.setFullName(dto.getFullName());
//                            p.setEmail(dto.getEmail());
//                            p.setTitle(dto.getTitle());
//                            p.setPosition(dto.getPosition());
//                            p.setDepartment(dto.getDepartment());
//                            p.setOrganization(dto.getOrganization());
//                            p.setNotes(dto.getNotes());
//                            return p;
//                        })
//                        .collect(Collectors.toList());
//                event.setParticipants(participants);
//            }

            event.setStatus(EventStatus.DRAFT);

            Event created = eventService.createPlan(event);
            log.info("Plan created successfully with ID: {}", created.getId());
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating plan", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody Event planDetails) {
        try {
            Event updated = eventService.updatePlan(id, planDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        eventService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/plans/{id}/submit")
    public ResponseEntity<?> submitPlanForApproval(@PathVariable String id) {
        try {
            Event plan = eventService.submitPlanForApproval(id);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/plans/pending")
    public ResponseEntity<List<PlanResponseDto>> getPlansPendingApproval() {
        return ResponseEntity.ok(eventService.getPlansPendingApproval());
    }

    @GetMapping("/admin/events/pending")
    public ResponseEntity<List<PlanResponseDto>> getEventsPendingApproval() {
        return ResponseEntity.ok(eventService.getEventsPendingApproval());
    }

    @PatchMapping("/admin/plans/{id}/approve")
    public ResponseEntity<?> approvePlan(@PathVariable String id,
                                         @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event approved = eventService.approvePlan(id, approverId);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/plans/{id}/reject")
    public ResponseEntity<?> rejectPlan(@PathVariable String id,
                                        @RequestParam(required = false) String reason,
                                        @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event rejected = eventService.rejectPlan(id, approverId, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/events/{id}/approve")
    public ResponseEntity<?> approveEvent(@PathVariable String id,
                                          @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event approved = eventService.approveEvent(id, approverId);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/events/{id}/reject")
    public ResponseEntity<?> rejectEvent(@PathVariable String id,
                                         @RequestParam(required = false) String reason,
                                         @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event rejected = eventService.rejectEvent(id, approverId, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/{planId}/create-event")
    public ResponseEntity<?> createEventFromPlan(@PathVariable String planId,
                                                 @RequestBody Event eventDetails,
                                                 @AuthenticationPrincipal Jwt jwt) {
        try {
            String accountId = jwt.getSubject();
            eventDetails.setCreatedByAccountId(accountId);
            Event newEvent = eventService.createEventFromPlan(planId, eventDetails);
            return new ResponseEntity<>(newEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<?> startEvent(@PathVariable String id) {
        try {
            Event event = eventService.startEvent(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeEvent(@PathVariable String id) {
        try {
            Event event = eventService.completeEvent(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(@PathVariable String id,
                                         @RequestParam(required = false) String reason) {
        try {
            Event event = eventService.cancelEvent(id, reason);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event saved = eventService.createEvent(event);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id,
                                             @Valid @RequestBody Event eventDetails) {
        Event updated = eventService.updateEvent(id, eventDetails);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/lucky-draw")
    public ResponseEntity<Void> updateLuckyDrawId(@PathVariable String id,
                                                  @RequestParam String luckyDrawId) {
        eventService.updateLuckyDrawId(id, luckyDrawId);
        return ResponseEntity.ok().build();
    }


    private boolean isPlanStatus(EventStatus status) {
        return status == EventStatus.DRAFT ||
                status == EventStatus.PLAN_PENDING_APPROVAL ||
                status == EventStatus.PLAN_APPROVED;
    }

    @GetMapping("/{eventId}/presenters")
    public ResponseEntity<List<EventPresenter>> getPresenters(@PathVariable String eventId) {
        return ResponseEntity.ok(presenterService.getPresenters(eventId));
    }

    @PostMapping("/{eventId}/presenters")
    public ResponseEntity<EventPresenter> addPresenter(
            @PathVariable String eventId,
            @RequestBody EventPresenter presenter,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(presenterService.addPresenter(eventId, presenter));
    }

    @DeleteMapping("/presenters/{presenterId}")
    public ResponseEntity<Void> removePresenter(@PathVariable String presenterId) {
        presenterService.removePresenter(presenterId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/presenters/{presenterId}/topic")
    public ResponseEntity<EventPresenter> updatePresenterTopic(
            @PathVariable String presenterId,
            @RequestParam String topic) {
        return ResponseEntity.ok(presenterService.updatePresenterTopic(presenterId, topic));
    }

    @PatchMapping("/presenters/{presenterId}/order")
    public ResponseEntity<EventPresenter> updatePresenterOrder(
            @PathVariable String presenterId,
            @RequestParam Integer orderIndex) {
        return ResponseEntity.ok(presenterService.updatePresenterOrder(presenterId, orderIndex));
    }

    @GetMapping("/{eventId}/participants")
    public ResponseEntity<List<EventParticipant>> getParticipants(@PathVariable String eventId) {
        return ResponseEntity.ok(participantService.getParticipants(eventId));
    }

    @PostMapping("/{eventId}/participants/register")
    public ResponseEntity<EventParticipant> registerParticipant(
            @PathVariable String eventId,
            @RequestBody EventParticipant participant) {
        return ResponseEntity.ok(participantService.registerParticipant(eventId, participant));
    }

    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<Void> cancelParticipant(
            @PathVariable String participantId,
            @RequestParam(required = false) String reason) {
        participantService.cancelParticipant(participantId, reason);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/participants/{participantId}/checkin")
    public ResponseEntity<Void> checkInParticipant(
            @PathVariable String participantId,
            @RequestParam String checkedInBy) {
        participantService.checkInParticipant(participantId, checkedInBy);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/participants/count")
    public ResponseEntity<Long> countParticipants(@PathVariable String eventId) {
        return ResponseEntity.ok(participantService.countParticipantsByEventId(eventId));
    }

    @GetMapping("/{eventId}/participants/status/{status}")
    public ResponseEntity<List<EventParticipant>> getParticipantsByStatus(
            @PathVariable String eventId,
            @PathVariable String status) {
        ParticipationStatus participationStatus =
                ParticipationStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(participantService.getParticipantsByStatus(eventId, participationStatus));
    }

    @GetMapping("/{eventId}/organizers")
    public ResponseEntity<List<EventOrganizer>> getOrganizers(@PathVariable String eventId) {
        return ResponseEntity.ok(organizerService.getOrganizers(eventId));
    }

    @PostMapping("/{eventId}/organizers")
    public ResponseEntity<EventOrganizer> addOrganizer(
            @PathVariable String eventId,
            @RequestBody EventOrganizer organizer,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(organizerService.addOrganizer(eventId, organizer));
    }

    @DeleteMapping("/organizers/{organizerId}")
    public ResponseEntity<Void> removeOrganizer(@PathVariable String organizerId) {
        organizerService.removeOrganizer(organizerId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/organizers/{organizerId}/role")
    public ResponseEntity<EventOrganizer> updateOrganizerRole(
            @PathVariable String organizerId,
            @RequestParam String role) {
        OrganizerRole organizerRole =
                OrganizerRole.valueOf(role.toUpperCase());
        return ResponseEntity.ok(organizerService.updateOrganizerRole(organizerId, organizerRole));
    }

    @PostMapping("/{eventId}/invite")
    public ResponseEntity<Map<String, String>> inviteParticipants(
            @PathVariable String eventId,
            @RequestBody List<String> inviteeIds,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String organizerId = jwt.getSubject();
        Map<String, String> response = eventService.invitateParticipants(eventId, organizerId, inviteeIds);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{eventId}/accept-invite")
    public ResponseEntity<Map<String, String>> acceptInvite(
            @PathVariable String eventId,
            @RequestParam String token) {

        log.info("Xác nhận lời mời cho sự kiện: {} với token: {}", eventId, token);
        Map<String, String> response = eventService.acceptInvite(eventId, token);
        return ResponseEntity.ok(response);
    }
}