package com.analyticsservice.service;

import com.analyticsservice.entity.EventAnalytic;
import java.util.List;
import java.util.Map;

public interface EventAnalyticService {
    EventAnalytic updateStats(String eventId, String type);
    EventAnalytic getStatsByEventId(String eventId);
    List<EventAnalytic> getAll();
    Map<String, Object> getAdminDashboardStats();
    Map<String, Object> getOrganizerReport(String eventId);
}
