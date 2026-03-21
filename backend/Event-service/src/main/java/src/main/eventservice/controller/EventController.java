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

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Event>> getFeatured() {
        List<Event> featured = eventService.getFeaturedEvents();
        return ResponseEntity.ok(featured);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        Optional<Event> event = eventService.getEventById(id);
        if (event.isPresent()) {
            return ResponseEntity.ok(event.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-events/this-month")
    public ResponseEntity<List<Event>> getMyEventsThisMonth(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        List<Event> myEvents = eventService.getMyEventsByAccountAndMonth(accountId);
        return ResponseEntity.ok(myEvents);
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    //5. Update theo id
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

    // 6. Lấy danh sách kế hoạch
    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponseDto>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlansEnriched());
    }

    @GetMapping("/plans/my")
    public ResponseEntity<List<PlanResponseDto>> getMyPlans(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(eventService.getPlansByAccountId(accountId));
    }

    @GetMapping("/status")
    public ResponseEntity<List<PlanResponseDto>> getByStatus(@RequestParam EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }

    @GetMapping("/plans/{statusName}")
    public ResponseEntity<List<Event>> getPlansByStatusName(
            @PathVariable String statusName,
            @RequestParam String accountId) {
        try {
            EventStatus status = Arrays.stream(EventStatus.values())
                    .filter(e -> e.name().equalsIgnoreCase(statusName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Invalid status"));

            return ResponseEntity.ok(eventService.getPlansByStatusById(status, accountId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @PostMapping("/plans")
    public ResponseEntity<?> createEventPlan(@RequestBody Event event) {
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
    }

    // Phê duyệt
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Event> approvePlan(
            @PathVariable String id,
            @RequestParam String approverId,
            @RequestParam String accountId) {

        if (approverId == null || approverId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Event approvedEvent = eventService.updateEventStatus(id, EventStatus.PUBLISHED, approverId, accountId);
        return ResponseEntity.ok(approvedEvent);
    }

    // Từ chối
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Event> rejectPlan(
            @PathVariable String id,
            @RequestParam String accountId) {

        Event rejectedEvent = eventService.updateEventStatus(id, EventStatus.CANCELLED, null, accountId);
        return ResponseEntity.ok(rejectedEvent);
    }
}