package src.main.eventservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.service.EventService;
import src.main.eventservice.entity.Event;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    @Autowired
    private EventService eventService;

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
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Tạo mới
    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventService.saveEvent(event);
    }

    // 4. Xóa theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    //5. Update theo id
    @PutMapping("/{id}")
    public ResponseEntity<Event> update(@PathVariable String id, @RequestBody Event event) {
        Event updatedEvent = eventService.updateEvent(id, event);
        return ResponseEntity.ok(updatedEvent);
    }

    // 6. Lấy danh sách kế hoạch
    @GetMapping("/plans")
    public ResponseEntity<List<Event>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlans());
    }

    // 7. Tạo kế hoạch mới
    @PostMapping("/plans")
    public ResponseEntity<Event> createPlan(@RequestBody Event event) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.saveEvent(event));
    }

    // 8. Phê duyệt kế hoạch
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Event> approvePlan(@PathVariable String id, @RequestParam String approverId) {
        Event approvedEvent = eventService.updateEventStatus(id, EventStatus.Published, approverId);
        return ResponseEntity.ok(approvedEvent);
    }

    // 9. Từ chối kế hoạch
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Event> rejectPlan(@PathVariable String id) {
        Event rejectedEvent = eventService.updateEventStatus(id, EventStatus.Cancelled, null);
        return ResponseEntity.ok(rejectedEvent);
    }
}