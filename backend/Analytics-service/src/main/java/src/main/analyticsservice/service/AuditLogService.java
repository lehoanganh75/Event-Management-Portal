package src.main.analyticsservice.service;

import jakarta.transaction.Transactional;
import src.main.analyticsservice.dto.TrackRequest;
import src.main.analyticsservice.entity.EventAnalytic;

public interface AuditLogService {
    @Transactional
    void recordAction(TrackRequest request);
}
