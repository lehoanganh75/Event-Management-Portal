package src.main.eventservice.service.impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.stream.Collectors;

@Service
public class EventRegistrationServiceImpl implements EventRegistrationService {

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private QRTokenUtil qrTokenUtil;

    // ✅ 1. ĐĂNG KÝ SỰ KIỆN
    @Transactional
    @Override
    public RegistrationResponseDto register(String eventId, String userProfileId) {
        // Kiểm tra đã đăng ký chưa
        if (registrationRepository.existsByEventIdAndUserProfileId(eventId, userProfileId)) {
            throw new RuntimeException("Bạn đã đăng ký sự kiện này rồi");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        // Kiểm tra trạng thái sự kiện
        if (event.getStatus() != EventStatus.Published
                && event.getStatus() != EventStatus.Ongoing) {
            throw new RuntimeException("Sự kiện không mở đăng ký");
        }

        // Kiểm tra hạn đăng ký
        if (event.getRegistrationDeadline() != null
                && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new RuntimeException("Đã hết hạn đăng ký");
        }

        // Kiểm tra số lượng
        long registeredCount = registrationRepository
                .findByEventIdAndStatus(eventId, RegistrationStatus.Registered).size();
        if (event.getMaxParticipants() > 0 && registeredCount >= event.getMaxParticipants()) {
            throw new RuntimeException("Sự kiện đã đủ số lượng tham gia");
        }

        // ✅ Kiểm tra trùng lịch
        List<EventRegistration> conflicts = registrationRepository.findConflictingRegistrations(
                userProfileId, event.getStartTime(), event.getEndTime(), eventId
        );
        if (!conflicts.isEmpty()) {
            Event conflictEvent = conflicts.get(0).getEvent();
            throw new RuntimeException(
                    "Bạn đã đăng ký sự kiện '" + conflictEvent.getTitle()
                            + "' trùng thời gian với sự kiện này"
            );
        }

        // Tạo registration
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUserProfileId(userProfileId);
        registration.setStatus(RegistrationStatus.Registered);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setEligibleForDraw(false);
        registration.setCheckedIn(false);

        // ✅ Tạo QR Token
        String qrToken = qrTokenUtil.generateQRToken(
                userProfileId, eventId, event.getEndTime()
        );
        registration.setQrToken(qrToken);
        registration.setQrTokenExpiry(qrTokenUtil.getExpiryFromToken(qrToken));

        EventRegistration saved = registrationRepository.save(registration);
        return toDto(saved);
    }

    // ✅ 2. LẤY QR CỦA REGISTRATION
    @Override
    public RegistrationResponseDto getRegistrationWithQR(String registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        // Regenerate token nếu hết hạn
        if (!qrTokenUtil.isTokenValid(registration.getQrToken())) {
            String newToken = qrTokenUtil.generateQRToken(
                    registration.getUserProfileId(),
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
                .findByEventIdAndUserProfileId(eventId, userId)
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
        registration.setStatus(RegistrationStatus.Attended);
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
        registration.setStatus(RegistrationStatus.Attended);
        registrationRepository.save(registration);

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in thủ công thành công!")
                .userProfileId(registration.getUserProfileId())
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
        return registrationRepository.findByUserProfileId(userProfileId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public boolean isRegistered(String eventId, String userProfileId) {
        return registrationRepository.existsByEventIdAndUserProfileId(eventId, userProfileId);
    }

    private RegistrationResponseDto toDto(EventRegistration r) {
        return RegistrationResponseDto.builder()
                .id(r.getId())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .eventStartTime(r.getEvent().getStartTime() != null
                        ? r.getEvent().getStartTime().toString() : null)
                .eventEndTime(r.getEvent().getEndTime() != null
                        ? r.getEvent().getEndTime().toString() : null)
                .eventLocation(r.getEvent().getLocation())
                .userProfileId(r.getUserProfileId())
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
    public RegistrationResponseDto cancelRegistration(String eventId, String userProfileId) {
        EventRegistration registration = registrationRepository
                .findByEventIdAndUserProfileId(eventId, userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        if (registration.isCheckedIn()) {
            throw new RuntimeException("Không thể hủy vì đã check-in rồi");
        }

        registration.setStatus(RegistrationStatus.Cancelled);
        return toDto(registrationRepository.save(registration));
    }
}