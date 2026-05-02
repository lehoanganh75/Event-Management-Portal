package com.eventservice.util;

import com.eventservice.entity.Event;
import com.eventservice.entity.EventRegistration;
import com.eventservice.entity.enums.RegistrationStatus;
import com.eventservice.repository.EventRegistrationRepository;
import com.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class MockDataSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    @Override
    public void run(String... args) throws Exception {
        String eventName = "Hội thảo Công nghệ AI và Tương lai 2026";
        
        // 1. Kiểm tra xem sự kiện đã có chưa
        List<Event> events = eventRepository.findAll().stream()
                .filter(e -> e.getTitle().equalsIgnoreCase(eventName))
                .toList();

        if (events.isEmpty()) {
            log.warn("MockDataSeeder: Không tìm thấy sự kiện '{}' để nạp dữ liệu.", eventName);
            return;
        }

        Event event = events.get(0);
        
        // 2. Kiểm tra xem đã có dữ liệu mẫu chưa (tránh nạp trùng)
        long existingCount = registrationRepository.countByEventIdAndIsDeletedFalse(event.getId());
        if (existingCount > 10) {
            log.info("MockDataSeeder: Sự kiện đã có {} người đăng ký. Bỏ qua bước nạp mẫu.", existingCount);
            return;
        }

        log.info("MockDataSeeder: Bắt đầu nạp 150 dữ liệu mẫu cho sự kiện: {}", eventName);
        
        Random random = new Random();
        List<EventRegistration> mockRegistrations = new ArrayList<>();
        
        for (int i = 1; i <= 150; i++) {
            // Giả lập thời gian đăng ký (trong vòng 7 ngày qua)
            LocalDateTime regTime = LocalDateTime.now().minusDays(random.nextInt(7)).minusHours(random.nextInt(24));
            
            EventRegistration reg = EventRegistration.builder()
                    .event(event)
                    .participantAccountId("mock_user_" + i)
                    .status(RegistrationStatus.REGISTERED)
                    .isDeleted(false)
                    .build();
            
            // 75% người dùng ảo sẽ có trạng thái "Đã tham gia" (Check-in)
            if (random.nextDouble() < 0.75) {
                reg.setCheckedIn(true);
                // Thời gian check-in tập trung vào buổi sáng (8h-10h)
                reg.setCheckInTime(regTime.withHour(8 + random.nextInt(2)).withMinute(random.nextInt(60)));
            } else {
                reg.setCheckedIn(false);
            }
            
            mockRegistrations.add(reg);
        }
        
        registrationRepository.saveAll(mockRegistrations);
        log.info("MockDataSeeder: Đã nạp thành công 150 bản ghi đăng ký ảo.");
    }
}
