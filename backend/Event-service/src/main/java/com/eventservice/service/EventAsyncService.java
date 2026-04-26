package com.eventservice.service;

import com.eventservice.client.LuckyDrawClient;
import com.eventservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventAsyncService {
    private final EventPostRepository postRepository;
    private final EventSessionRepository sessionRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventOrganizerRepository organizerRepository;
    private final EventPresenterRepository presenterRepository;
    private final EventInvitationRepository invitationRepository;
    private final LuckyDrawClient luckyDrawClient;

    @Async
    @Transactional
    public void cascadeDeleteEventData(String eventId, boolean hasLuckyDraw) {
        log.info("Bắt đầu dọn dẹp dữ liệu ngầm cho sự kiện: {}", eventId);
        try {
            // 1. Cascade Soft Delete các nội dung liên quan (Dùng Native SQL - Cực nhanh)
            postRepository.softDeleteByEventId(eventId);
            sessionRepository.softDeleteByEventId(eventId);
            registrationRepository.softDeleteByEventId(eventId);
            organizerRepository.softDeleteByEventId(eventId);
            presenterRepository.softDeleteByEventId(eventId);
            invitationRepository.softDeleteByEventId(eventId);

            // 2. Xử lý xóa dịch vụ liên quan bên ngoài (Qua Feign Client)
            if (hasLuckyDraw) {
                try {
                    luckyDrawClient.softDeleteByEventId(eventId);
                } catch (Exception e) {
                    log.error("Lỗi khi xóa dịch vụ Lucky Draw ngầm: {}", e.getMessage());
                }
            }
            log.info("Hoàn tất dọn dẹp dữ liệu cho sự kiện: {}", eventId);
        } catch (Exception e) {
            log.error("Lỗi nghiêm trọng trong quá trình dọn dẹp ngầm cho sự kiện {}: {}", eventId, e.getMessage());
        }
    }
}
