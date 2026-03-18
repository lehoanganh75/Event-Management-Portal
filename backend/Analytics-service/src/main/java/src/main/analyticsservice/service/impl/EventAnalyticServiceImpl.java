package src.main.analyticsservice.service.impl;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import src.main.analyticsservice.entity.EventAnalytic;
import src.main.analyticsservice.repository.EventAnalyticsRepository;
import src.main.analyticsservice.service.EventAnalyticService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventAnalyticServiceImpl implements EventAnalyticService {

    @Autowired
    private EventAnalyticsRepository repository;

    @Transactional
    @Override
    public EventAnalytic updateStats(String eventId, String type) {
        if (!repository.existsById(eventId)) {
            EventAnalytic newAnalytic = new EventAnalytic();
            newAnalytic.setEventId(eventId);
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
        return repository.findById(eventId).orElse(null);
    }

    @Override
    public List<EventAnalytic> getAll() {
        return repository.findAll();
    }

    @Override
    public Map<String, Object> getAdminDashboardStats() {
        List<EventAnalytic> allData = repository.findAll();

        int totalEvents = allData.size();
        int totalLikes = allData.stream().mapToInt(EventAnalytic::getTotalLikes).sum();
        int totalRegistrations = allData.stream().mapToInt(EventAnalytic::getTotalRegistrations).sum();
        int totalAttendees = allData.stream().mapToInt(EventAnalytic::getTotalAttendees).sum();

        double avgConversion = allData.stream()
                .mapToDouble(EventAnalytic::getConversionRate)
                .average().orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("totalLikes", totalLikes);
        stats.put("totalRegistrations", totalRegistrations);
        stats.put("totalAttendees", totalAttendees);
        stats.put("avgConversion", avgConversion);

        return stats;
    }

    @Override
    public Map<String, Object> getOrganizerReport(String eventId) {
        EventAnalytic analytic = repository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu sự kiện"));

        analytic.calculateConversion();

        Map<String, Object> report = new HashMap<>();
        report.put("stats", analytic);

        String performanceNote = analytic.getConversionRate() > 70 ?
                "Sự kiện thành công vượt mong đợi" : "Cần cải thiện khâu nhắc lịch tham gia";

        report.put("performanceNote", performanceNote);

        report.put("qualityScore", analytic.getAverageRating() * 20);

        return report;
    }

    public Map<String, Object> getAdminOverallAnalysis() {
        Map<String, Object> stats = getAdminDashboardStats();
        List<EventAnalytic> allData = getAll();

        EventAnalytic hotEvent = allData.stream()
                .max((e1, e2) -> Integer.compare(
                        e1.getTotalLikes() + e1.getTotalComments(),
                        e2.getTotalLikes() + e2.getTotalComments()))
                .orElse(null);

        stats.put("hotEvent", hotEvent);
        return stats;
    }

    @Transactional
    public Map<String, Object> finalizeEventAnalysis(String eventId) {
        EventAnalytic analytic = repository.findById(eventId).orElseThrow();

        analytic.calculateConversion();

        Map<String, Object> finalReport = new HashMap<>();
        finalReport.put("totalSuccess", analytic.getTotalAttendees());
        finalReport.put("engagementRate", analytic.getConversionRate());
        finalReport.put("feedbackScore", analytic.getAverageRating());

        return finalReport;
    }

    @Transactional
    @Override
    public EventAnalytic updateFeedbackStats(String eventId, int newRating, boolean isPromoter, boolean isDetractor) {
        EventAnalytic analytic = repository.findById(eventId)
                .orElseGet(() -> {
                    EventAnalytic newAnalytic = new EventAnalytic();
                    newAnalytic.setEventId(eventId);
                    return repository.save(newAnalytic);
                });

        double currentAvg = analytic.getAverageRating();
        int totalFeedbacks = analytic.getTotalComments();

        double newAvg = ((currentAvg * totalFeedbacks) + newRating) / (totalFeedbacks + 1);
        analytic.setAverageRating(newAvg);
        analytic.setTotalComments(totalFeedbacks + 1);

        return repository.save(analytic);
    }
}