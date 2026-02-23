package src.main.userservice.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import src.main.userservice.dto.UserCreatedEvent;
import src.main.userservice.service.UserProfileService;

import java.time.LocalDate;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j // Để in log kiểm tra
public class UserEventListener {
    private final UserProfileService profileService;

    // @KafkaListener biến class này thành một "người nghe"
    @KafkaListener(topics = "user-registration-topic", groupId = "user-service-group")
    public void handleUserRegistration(Map<String, String> message) {
        try {
            UserCreatedEvent userCreatedEvent = new UserCreatedEvent();
            userCreatedEvent.setAccountId(message.get("accountId"));
            userCreatedEvent.setFullName(message.get("fullName"));
            userCreatedEvent.setGender(message.get("gender"));
            userCreatedEvent.setDateOfBirth(LocalDate.parse(message.get("dateOfBirth")));
            log.info("Kafka nhận được yêu cầu tạo Profile cho Account ID: {}", userCreatedEvent.getAccountId());

            // Gọi Service để thực hiện logic tạo Profile trong DB
            profileService.createInitialProfile(userCreatedEvent);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý tin nhắn từ Kafka: ", e);
        }
    }
}