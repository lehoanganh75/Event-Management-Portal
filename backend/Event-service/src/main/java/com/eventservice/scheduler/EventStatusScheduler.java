package com.eventservice.scheduler;

import com.eventservice.entity.enums.EventStatus;
import com.eventservice.kafka.EventStatusProducer;
import com.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventStatusScheduler {

    private final EventRepository eventRepository;
    private final EventStatusProducer eventStatusProducer;

    /**
     * Tự động cập nhật trạng thái sự kiện thành COMPLETED nếu thời gian kết thúc đã
     * qua.
     * Chạy mỗi phút một lần.
     */
    @Scheduled(fixedRate = 60000) // 60 seconds
    @Transactional
    public void autoUpdateEventStatus() {
        LocalDateTime now = LocalDateTime.now();

        List<EventStatus> activeStatuses = List.of(
                EventStatus.PUBLISHED,
                EventStatus.ONGOING);

        List<String> expiredEventIds = eventRepository.findExpiredEventIds(activeStatuses, now);

        if (!expiredEventIds.isEmpty()) {
            int updatedCount = eventRepository.updateStatusesByIds(expiredEventIds, EventStatus.COMPLETED);
            log.info("Auto-completed {} events at {}", updatedCount, now);

            for (String eventId : expiredEventIds) {
                // Chúng ta không biết chắc chắn status cũ là cái nào trong list activeStatuses
                // Nhưng chúng ta biết nó đã chuyển sang COMPLETED
                eventStatusProducer.sendEventStatusChange(eventId, "ACTIVE", "COMPLETED");
            }
        }
    }
}
