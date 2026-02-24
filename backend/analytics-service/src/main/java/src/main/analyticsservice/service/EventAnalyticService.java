package src.main.analyticsservice.service;

import jakarta.transaction.Transactional;
import src.main.analyticsservice.entity.EventAnalytic;

import java.util.List;
import java.util.Map;

public interface EventAnalyticService {
    EventAnalytic updateStats(String eventId, String type);
    EventAnalytic getStatsByEventId(String eventId);
    List<EventAnalytic> getAll();
    Map<String, Object> getAdminDashboardStats();

    Map<String, Object> getOrganizerReport(String eventId);

    // Trong EventAnalyticServiceImpl.java
    @Transactional
    EventAnalytic updateFeedbackStats(String eventId, int newRating, boolean isPromoter, boolean isDetractor);
}
