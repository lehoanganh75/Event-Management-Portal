package src.main.eventservice.service.impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.eventservice.dto.CheckInRequest;
import src.main.eventservice.dto.CheckInResponse;
import src.main.eventservice.dto.RegistrationResponseDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventRegistration;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.entity.enums.RegistrationStatus;
import src.main.eventservice.repository.EventRegistrationRepository;
import src.main.eventservice.repository.EventRepository;
import src.main.eventservice.service.EventRegistrationService;
import src.main.eventservice.util.QRTokenUtil;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventRegistrationServiceImpl implements EventRegistrationService {
    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final QRTokenUtil qrTokenUtil;

    @Override
    public Optional<EventRegistration> findByEventIdAndUserRegistrationId(String eventId, String userRegistrationId) {
        return registrationRepository.findByEventIdAndUserRegistrationId(eventId, userRegistrationId);
    }

    @Transactional
    @Override
    public EventRegistration registerUserToEvent(String eventId, String userRegistrationId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        Optional<EventRegistration> existingReg = registrationRepository
                .findByEventIdAndUserRegistrationId(eventId, userRegistrationId);

        EventRegistration registration;

        if (existingReg.isPresent()) {
            registration = existingReg.get();
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                throw new RuntimeException("Bạn đã đăng ký sự kiện này rồi");
            }
        } else {
            registration = new EventRegistration();
            registration.setEvent(event);
            registration.setUserRegistrationId(userRegistrationId);
        }

        registration.setEligibleForDraw(true);
        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setCheckedIn(false);

        // 4. Tạo QR Token mới
        String qrToken = qrTokenUtil.generateQRToken(
                userRegistrationId, eventId, event.getEndTime()
        );
        registration.setQrToken(qrToken);
        registration.setQrTokenExpiry(qrTokenUtil.getExpiryFromToken(qrToken));

        return registrationRepository.save(registration);
    }

    // ✅ 2. LẤY QR CỦA REGISTRATION
    @Override
    public RegistrationResponseDto getRegistrationWithQR(String registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        // Regenerate token nếu hết hạn
        if (!qrTokenUtil.isTokenValid(registration.getQrToken())) {
            String newToken = qrTokenUtil.generateQRToken(
                    registration.getUserRegistrationId(),
                    registration.getEvent().getId(),
                    registration.getEvent().getEndTime()
            );
            registration.setQrToken(newToken);
            registration.setQrTokenExpiry(qrTokenUtil.getExpiryFromToken(newToken));
            registrationRepository.save(registration);
        }

        return toDto(registration);
    }

    // ✅ 3. CHECK-IN BẰNG QR
    @Transactional
    @Override
    public CheckInResponse checkIn(CheckInRequest request) {
        // Validate token
        Claims claims;
        try {
            claims = qrTokenUtil.verifyQRToken(request.getQrToken());
        } catch (ExpiredJwtException e) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("QR code đã hết hạn")
                    .build();
        } catch (Exception e) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("QR code không hợp lệ")
                    .build();
        }

        String userId = claims.get("userId", String.class);
        String eventId = claims.get("eventId", String.class);

        // Tìm registration
        EventRegistration registration = registrationRepository
                .findByEventIdAndUserRegistrationId(eventId, userId)
                .orElse(null);

        if (registration == null) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("User chưa đăng ký sự kiện này")
                    .build();
        }

        // Kiểm tra token khớp DB
        if (!request.getQrToken().equals(registration.getQrToken())) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("QR code không khớp")
                    .build();
        }

        // Kiểm tra đã check-in chưa
        if (registration.isCheckedIn()) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("User đã check-in trước đó lúc "
                            + registration.getCheckInTime())
                    .build();
        }

        // Kiểm tra thời gian check-in (cho phép trước 30 phút)
        Event event = registration.getEvent();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime checkInOpen = event.getStartTime().minusMinutes(30);
        LocalDateTime checkInClose = event.getEndTime();

        if (now.isBefore(checkInOpen)) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Chưa đến giờ check-in. Mở check-in lúc "
                            + checkInOpen)
                    .build();
        }

        if (now.isAfter(checkInClose)) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Sự kiện đã kết thúc, không thể check-in")
                    .build();
        }

        registration.setCheckedIn(true);
        registration.setCheckInTime(now);
        registration.setCheckInByAccountId(request.getAdminAccountId());
        registration.setStatus(RegistrationStatus.ATTENDED);
        registrationRepository.save(registration);

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in thành công!")
                .userProfileId(userId)
                .eventId(eventId)
                .eventTitle(event.getTitle())
                .checkInTime(now.toString())
                .build();
    }

    @Transactional
    @Override
    public CheckInResponse manualCheckIn(String registrationId, String adminAccountId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        if (registration.isCheckedIn()) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("User đã check-in trước đó")
                    .build();
        }

        registration.setCheckedIn(true);
        registration.setCheckInTime(LocalDateTime.now());
        registration.setCheckInByAccountId(adminAccountId);
        registration.setStatus(RegistrationStatus.ATTENDED);
        registrationRepository.save(registration);

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in thủ công thành công!")
                .userProfileId(registration.getUserRegistrationId())
                .eventId(registration.getEvent().getId())
                .eventTitle(registration.getEvent().getTitle())
                .checkInTime(registration.getCheckInTime().toString())
                .build();
    }

    @Override
    public List<RegistrationResponseDto> getRegistrationsByEvent(String eventId) {
        return registrationRepository.findByEventId(eventId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDto> getRegistrationsByUser(String userProfileId) {
        return registrationRepository.findByUserRegistrationId(userProfileId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private RegistrationResponseDto toDto(EventRegistration r) {
        return RegistrationResponseDto.builder()
                .id(r.getId())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .userProfileId(r.getUserRegistrationId())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .registeredAt(r.getRegisteredAt() != null ? r.getRegisteredAt().toString() : null)
                .qrToken(r.getQrToken())
                .qrTokenExpiry(r.getQrTokenExpiry() != null ? r.getQrTokenExpiry().toString() : null)
                .checkedIn(r.isCheckedIn())
                .checkInTime(r.getCheckInTime() != null ? r.getCheckInTime().toString() : null)
                .build();
    }

    @Transactional
    @Override
    public EventRegistration cancelRegistration(String eventId, String userProfileId) {
        EventRegistration registration = registrationRepository
                .findByEventIdAndUserRegistrationId(eventId, userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        if (registration.isCheckedIn()) {
            throw new RuntimeException("Không thể hủy vì đã check-in rồi");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        return registrationRepository.save(registration);
    }
}