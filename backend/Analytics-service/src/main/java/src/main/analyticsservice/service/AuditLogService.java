package src.main.analyticsservice.service;

import jakarta.transaction.Transactional;
import src.main.analyticsservice.dto.TrackRequest;

public interface AuditLogService {
    @Transactional
    void recordAction(TrackRequest request);
}
