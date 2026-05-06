package com.analyticsservice.service.impl;

import com.analyticsservice.entity.EventAnalytic;
import com.analyticsservice.repository.EventAnalyticsRepository;
import com.analyticsservice.service.EventAnalyticService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventAnalyticServiceImpl implements EventAnalyticService {

    private final EventAnalyticsRepository repository;

    @Override
    @Transactional
    public EventAnalytic updateStats(String eventId, String type) {
        if (!repository.existsById(eventId)) {
            EventAnalytic newAnalytic = EventAnalytic.builder()
                    .eventId(eventId)
                    .build();
            repository.saveAndFlush(newAnalytic);
        }

        switch (type.toUpperCase()) {
            case "LIKE" -> repository.incrementLikes(eventId);
            case "REGISTER" -> repository.incrementRegistrations(eventId);
            case "ATTEND" -> repository.incrementAttendees(eventId);
        }

        return repository.findById(eventId).orElse(null);
    }

    @Override
    public EventAnalytic getStatsByEventId(String eventId) {
        return repository.findById(eventId)
                .orElse(EventAnalytic.builder()
                        .eventId(eventId)
                        .totalLikes(0)
                        .totalComments(0)
                        .totalRegistrations(0)
                        .totalAttendees(0)
                        .averageRating(0.0)
                        .build());
    }

    @Override
    public List<EventAnalytic> getAll() {
        return repository.findAll();
    }

    @Override
    public Map<String, Object> getAdminDashboardStats() {
        List<EventAnalytic> allData = repository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", allData.size());
        stats.put("totalLikes", allData.stream().mapToInt(EventAnalytic::getTotalLikes).sum());
        stats.put("totalRegistrations", allData.stream().mapToInt(EventAnalytic::getTotalRegistrations).sum());
        stats.put("totalAttendees", allData.stream().mapToInt(EventAnalytic::getTotalAttendees).sum());

        return stats;
    }

    @Override
    public Map<String, Object> getOrganizerReport(String eventId) {
        EventAnalytic analytic = repository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu"));

        analytic.calculateConversion();

        Map<String, Object> report = new HashMap<>();
        report.put("stats", analytic);
        return report;
    }
}
