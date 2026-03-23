package src.main.eventservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.service.EventService;
import src.main.eventservice.entity.Event;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping("/featured")
    public ResponseEntity<List<Event>> getFeatured() {
        List<Event> featured = eventService.getFeaturedEvents();
        return ResponseEntity.ok(featured);
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<PlanResponseDto>> getMyEvents(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(eventService.getEventsByAccountId(accountId));
    }

    @GetMapping("/my-events/this-month")
    public ResponseEntity<List<Event>> getMyEventsThisMonth(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        List<Event> myEvents = eventService.getMyEventsByAccountAndMonth(accountId);
        return ResponseEntity.ok(myEvents);
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
    public ResponseEntity<List<Event>> getPlansByStatusName(
            @PathVariable String statusName,
            @RequestParam String accountId) {
        try {
            EventStatus status = Arrays.stream(EventStatus.values())
                    .filter(e -> e.name().equalsIgnoreCase(statusName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Invalid status"));

            if (status != EventStatus.DRAFT &&
                    status != EventStatus.PLAN_PENDING_APPROVAL &&
                    status != EventStatus.PLAN_APPROVED) {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(eventService.getPlansByStatusById(status, accountId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/events/status/{status}")
    public ResponseEntity<List<PlanResponseDto>> getEventsByStatus(@PathVariable EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }

    @GetMapping("/admin/plans/pending")
    public ResponseEntity<List<PlanResponseDto>> getPlansPendingApproval() {
        return ResponseEntity.ok(eventService.getPlansPendingApproval());
    }

    @GetMapping("/admin/events/pending")
    public ResponseEntity<List<PlanResponseDto>> getEventsPendingApproval() {
        return ResponseEntity.ok(eventService.getEventsPendingApproval());
    }

    // ==================== ENDPOINTS CÓ PATH VARIABLE (ĐẶT SAU) ====================

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        Optional<Event> event = eventService.getEventById(id);
        if (event.isPresent()) {
            return ResponseEntity.ok(event.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Event> update(@PathVariable String id, @Valid @RequestBody Event event) {
        Event updatedEvent = eventService.updateEvent(id, event);
        return ResponseEntity.ok(updatedEvent);
    }

    @PutMapping("/{id}/lucky-draw")
    public ResponseEntity<Void> updateLuckyDrawId(
            @PathVariable String id,
            @RequestParam String luckyDrawId) {
        eventService.updateLuckyDrawId(id, luckyDrawId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@RequestBody Event event) {
        try {
            Event createdEvent = eventService.createPlan(event);
            return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error", e.getMessage(),
                            "cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown"
                    ));
        }
    @GetMapping("/by-statuses")
    public ResponseEntity<List<Event>> getEventsByStatuses(
            @RequestParam("statuses") List<String> statusStrings) {

        List<EventStatus> statuses = statusStrings.stream()
                .map(s -> EventStatus.valueOf(s.trim().toUpperCase()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventService.getEventsByStatuses(statuses));
    }

    // 6. Lấy danh sách kế hoạch
    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponseDto>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlansEnriched());
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody Event planDetails) {
        try {
            Event updatedPlan = eventService.updatePlan(id, planDetails);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
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
    @GetMapping("/plans/{statusName}")
    public ResponseEntity<List<Event>> getPlansByStatusName(
            @PathVariable String statusName,
            @RequestParam String accountId) {
        try {
            Event submittedPlan = eventService.submitPlanForApproval(id);
            return ResponseEntity.ok(submittedPlan);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/{planId}/create-event")
    public ResponseEntity<?> createEventFromPlan(
            @PathVariable String planId,
            @RequestBody Event eventDetails,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String accountId = jwt.getClaimAsString("accountId");
            eventDetails.setCreatedByAccountId(accountId);
            Event newEvent = eventService.createEventFromPlan(planId, eventDetails);
            return new ResponseEntity<>(newEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/plans/{id}/approve")
    public ResponseEntity<?> approvePlan(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getClaimAsString("accountId");
            Event approvedPlan = eventService.approvePlan(id, approverId);
            return ResponseEntity.ok(approvedPlan);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/plans/{id}/reject")
    public ResponseEntity<?> rejectPlan(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getClaimAsString("accountId");
            Event rejectedPlan = eventService.rejectPlan(id, approverId, reason);
            return ResponseEntity.ok(rejectedPlan);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/events/{id}/approve")
    public ResponseEntity<?> approveEvent(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getClaimAsString("accountId");
            Event approvedEvent = eventService.approveEvent(id, approverId);
            return ResponseEntity.ok(approvedEvent);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/events/{id}/reject")
    public ResponseEntity<?> rejectEvent(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getClaimAsString("accountId");
            Event rejectedEvent = eventService.rejectEvent(id, approverId, reason);
            return ResponseEntity.ok(rejectedEvent);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<?> startEvent(@PathVariable String id) {
        try {
            Event startedEvent = eventService.startEvent(id);
            return ResponseEntity.ok(startedEvent);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeEvent(@PathVariable String id) {
        try {
            Event completedEvent = eventService.completeEvent(id);
            return ResponseEntity.ok(completedEvent);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        try {
            Event cancelledEvent = eventService.cancelEvent(id, reason);
            return ResponseEntity.ok(cancelledEvent);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @Deprecated
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Event> approvePlanDeprecated(
            @PathVariable String id,
            @RequestParam String approverId,
            @RequestParam String accountId) {
        Event approvedEvent = eventService.updateEventStatus(id, EventStatus.PUBLISHED, approverId, accountId);
        return ResponseEntity.ok(approvedEvent);
    }

    @Deprecated
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Event> rejectPlanDeprecated(
            @PathVariable String id,
            @RequestParam String accountId) {
        Event rejectedEvent = eventService.updateEventStatus(id, EventStatus.CANCELLED, null, accountId);
        return ResponseEntity.ok(rejectedEvent);
    }

    @Deprecated
    @GetMapping("/status")
    public ResponseEntity<List<PlanResponseDto>> getByStatus(@RequestParam EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }
}