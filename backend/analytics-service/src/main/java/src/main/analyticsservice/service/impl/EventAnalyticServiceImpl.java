package src.main.analyticsservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.analyticsservice.repository.EventAnalyticsRepository;
import src.main.analyticsservice.service.EventAnalyticService;

@Service
@RequiredArgsConstructor
public class EventAnalyticServiceImpl implements EventAnalyticService {
    private final EventAnalyticsRepository eventAnalyticsRepository;
}
