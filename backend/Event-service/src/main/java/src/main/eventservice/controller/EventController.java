package src.main.eventservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.service.EventService;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/featured")
    public ResponseEntity<List<Event>> getFeaturedEvents() {
        return ResponseEntity.ok(eventService.getFeaturedEvents());
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<PlanResponseDto>> getMyEvents(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(eventService.getEventsByAccountId(accountId));
    }

    @GetMapping("/my-events/this-month")
    public ResponseEntity<List<Event>> getMyEventsThisMonth(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(eventService.getMyEventsByAccountAndMonth(accountId));
    }

    @GetMapping("/by-statuses")
    public ResponseEntity<List<Event>> getEventsByStatuses(@RequestParam List<String> statuses) {
        try {
            List<EventStatus> statusList = statuses.stream()
                    .map(s -> EventStatus.valueOf(s.trim().toUpperCase()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(eventService.getEventsByStatuses(statusList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponseDto>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlansEnriched());
    }

    @GetMapping("/plans/my")
    public ResponseEntity<List<PlanResponseDto>> getMyPlans(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(eventService.getPlansByAccountId(accountId));
    }

    @GetMapping("/plans/status/{statusName}")
    public ResponseEntity<List<Event>> getPlansByStatus(
            @PathVariable String statusName,
            @RequestParam String accountId) {

        try {
            EventStatus status = Arrays.stream(EventStatus.values())
                    .filter(s -> s.name().equalsIgnoreCase(statusName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Invalid status: " + statusName));

            if (!isPlanStatus(status)) {
                return ResponseEntity.badRequest().build();
            }

            List<Event> plans = eventService.getPlansByStatusById(status, accountId);
            return ResponseEntity.ok(plans);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@Valid @RequestBody Event event) {
        try {
            Event created = eventService.createPlan(event);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
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
            String approverId = jwt.getClaimAsString("accountId");
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
            String approverId = jwt.getClaimAsString("accountId");
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
            String approverId = jwt.getClaimAsString("accountId");
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
            String approverId = jwt.getClaimAsString("accountId");
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
            String accountId = jwt.getClaimAsString("accountId");
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
}