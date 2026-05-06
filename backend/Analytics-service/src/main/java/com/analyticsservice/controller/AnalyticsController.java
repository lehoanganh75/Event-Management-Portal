package com.analyticsservice.controller;

import com.analyticsservice.entity.EventAnalytic;
import com.analyticsservice.entity.EventSummaryReport;
import com.analyticsservice.service.AISummaryService;
import com.analyticsservice.service.EventAnalyticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final EventAnalyticService analyticService;
    private final AISummaryService aiSummaryService;

    @GetMapping("/{eventId}")
    public ResponseEntity<EventAnalytic> getEventStats(@PathVariable String eventId) {
        return ResponseEntity.ok(analyticService.getStatsByEventId(eventId));
    }

    @GetMapping("/summary")
    public ResponseEntity<List<EventAnalytic>> getAllStats() {
        return ResponseEntity.ok(analyticService.getAll());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(analyticService.getAdminDashboardStats());
    }

    // --- AI Summary Endpoints ---

    @GetMapping("/ai-summary/{eventId}")
    public ResponseEntity<EventSummaryReport> getEventAISummary(@PathVariable String eventId) {
        return ResponseEntity.ok(aiSummaryService.getSummaryByEventId(eventId));
    }

    @PostMapping("/ai-summary/{eventId}/generate")
    public ResponseEntity<EventSummaryReport> triggerAISummary(@PathVariable String eventId) {
        return ResponseEntity.ok(aiSummaryService.generateSummary(eventId));
    }

    @GetMapping("/ai-summary/{eventId}/export")
    public ResponseEntity<byte[]> exportAISummary(@PathVariable String eventId) {
        byte[] data = aiSummaryService.exportToWord(eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Bao_cao_su_kien_" + eventId + ".docx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }
}
