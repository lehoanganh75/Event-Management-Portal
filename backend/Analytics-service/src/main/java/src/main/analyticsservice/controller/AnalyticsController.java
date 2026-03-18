package src.main.analyticsservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.analyticsservice.dto.TrackRequest;
import src.main.analyticsservice.entity.EventAnalytic;
import src.main.analyticsservice.service.AuditLogService;
import src.main.analyticsservice.service.EventAnalyticService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private EventAnalyticService service;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/{eventId}")
    public ResponseEntity<EventAnalytic> getEventStats(@PathVariable String eventId) {
        return ResponseEntity.ok(service.getStatsByEventId(eventId));
    }
    @PostMapping("/track")
    public ResponseEntity<String> track(@RequestBody TrackRequest request) {
        auditLogService.recordAction(request);
        return ResponseEntity.ok("Tracked successfully");
    }

    @GetMapping("/summary")
    public ResponseEntity<List<EventAnalytic>> getAllStats() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/admin/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(service.getAdminDashboardStats());
    }

    @GetMapping("/organizer/report/{eventId}")
    public ResponseEntity<Map<String, Object>> getEventReport(@PathVariable String eventId) {
        return ResponseEntity.ok(service.getOrganizerReport(eventId));
    }


}