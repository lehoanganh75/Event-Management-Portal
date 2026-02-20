package src.main.analyticsservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import src.main.analyticsservice.service.AuditLogService;
import src.main.analyticsservice.service.EventAnalyticService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AuditLogService auditLogService;
    private final EventAnalyticService eventAnalyticService;

}