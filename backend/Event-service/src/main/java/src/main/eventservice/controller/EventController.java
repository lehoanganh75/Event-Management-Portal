package src.main.eventservice.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.client.UserServiceClient;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.dto.UserDto;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.service.EventService;
import src.main.eventservice.entity.Event;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService eventService;
    @Autowired
    private UserServiceClient userServiceClient;

    private static final Logger log = LoggerFactory.getLogger(EventController.class);
    // 1. Lấy tất cả sự kiện
    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Event>> getFeatured() {
        List<Event> featured = eventService.getFeaturedEvents();
        return ResponseEntity.ok(featured);
    }
    // 2. Lấy chi tiết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<PlanResponseDto> getEventById(@PathVariable String id) {
        Event event = eventService.getEventById(id)
                .orElse(null);

        if (event == null) return ResponseEntity.notFound().build();

        UserDto creator = null;
        UserDto approver = null;

        try {
            if (event.getCreatedByAccountId() != null) {
                creator = userServiceClient.getUserById(event.getCreatedByAccountId());
            }
        } catch (Exception e) {
            log.warn("Không lấy được creator: {}", e.getMessage());
        }

        try {
            if (event.getApprovedByAccountId() != null) {
                approver = userServiceClient.getUserById(event.getApprovedByAccountId());
            }
        } catch (Exception e) {
            log.warn("Không lấy được approver: {}", e.getMessage());
        }

        return ResponseEntity.ok(PlanResponseDto.from(event, creator, approver));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PlanResponseDto>> getMyEvents(@RequestParam String accountId) {
        return ResponseEntity.ok(eventService.getEventsByAccountId(accountId));
    }

    // 3. Tạo mới
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event created = eventService.saveEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    // 4. Xóa theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    //5. Update theo id
    @PutMapping("/{id}")
    public ResponseEntity<Event> update(@PathVariable String id, @Valid @RequestBody Event event) {
        Event updatedEvent = eventService.updateEvent(id, event);
        return ResponseEntity.ok(updatedEvent);
    }

    // 6. Lấy danh sách kế hoạch
    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponseDto>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlansEnriched());
    }

    @GetMapping("/plans/my")
    public ResponseEntity<List<PlanResponseDto>> getMyPlans(@RequestParam String accountId) {
        return ResponseEntity.ok(eventService.getPlansByAccountId(accountId));
    }

//    @GetMapping("/plans/{statusName}")
//    public ResponseEntity<List<Event>> getPlansByStatusName(@PathVariable String statusName) {
//        try {
//            String formattedStatus = statusName.substring(0, 1).toUpperCase()
//                    + statusName.substring(1).toLowerCase();
//
//            EventStatus status = EventStatus.valueOf(formattedStatus);
//            return ResponseEntity.ok(eventService.getPlansByStatus(status));
//        } catch (IllegalArgumentException | IndexOutOfBoundsException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }
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
            log.info("Received event: {}", event);
            Event createdEvent = eventService.createPlan(event);
            return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating event: ", e);
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

        Event approvedEvent = eventService.updateEventStatus(id, EventStatus.Published, approverId, accountId);
        return ResponseEntity.ok(approvedEvent);
    }

    // Từ chối
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Event> rejectPlan(
            @PathVariable String id,
            @RequestParam String accountId) {

        Event rejectedEvent = eventService.updateEventStatus(id, EventStatus.Cancelled, null, accountId);
        return ResponseEntity.ok(rejectedEvent);
    }
}