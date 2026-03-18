package src.main.analyticsservice.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import src.main.analyticsservice.dto.TrackRequest;
import src.main.analyticsservice.entity.AuditLog;
import src.main.analyticsservice.repository.AuditLogRepository;
import src.main.analyticsservice.service.AuditLogService;
import src.main.analyticsservice.service.EventAnalyticService;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private EventAnalyticService eventAnalyticService;

    @Transactional
    @Override
    public void recordAction(TrackRequest request) {
        AuditLog log = new AuditLog();
        log.setEntityType(request.getEntityType());
        log.setEntityId(request.getEntityId());
        log.setAction(request.getAction());
        log.setPerformedByAccountId(request.getAccountId());
        auditLogRepository.save(log);

        if ("EVENT".equalsIgnoreCase(request.getEntityType())) {
            eventAnalyticService.updateStats(request.getEntityId(), request.getAction());
        }
        if ("FEEDBACK".equalsIgnoreCase(request.getEntityType())) {
            int rating = Integer.parseInt(request.getAction().split("_")[1]);
            boolean isPromoter = rating >= 9;
            boolean isDetractor = rating <= 6;

            eventAnalyticService.updateFeedbackStats(request.getEntityId(), rating, isPromoter, isDetractor);
        }
    }

}
