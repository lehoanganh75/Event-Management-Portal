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
        return registrationRepository.findByEventIdAndParticipantAccountId(eventId, userRegistrationId);
    }

    @Transactional
    @Override
    public EventRegistration registerUserToEvent(String eventId, String userRegistrationId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        if (event.getStatus() != EventStatus.PUBLISHED
                && event.getStatus() != EventStatus.ONGOING) {
            throw new RuntimeException("Sự kiện không mở đăng ký");
        }

        if (event.getRegistrationDeadline() != null
                && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new RuntimeException("Đã hết hạn đăng ký");
        }

        long registeredCount = registrationRepository
                .findByEventIdAndStatus(eventId, RegistrationStatus.REGISTERED).size();

        if (event.getMaxParticipants() > 0 && registeredCount >= event.getMaxParticipants()) {
            throw new RuntimeException("Sự kiện đã đủ số lượng tham gia");
        }

        List<EventRegistration> conflicts = registrationRepository.findConflictingRegistrations(
                userRegistrationId, event.getStartTime(), event.getEndTime(), eventId, RegistrationStatus.REGISTERED
        );

        if (!conflicts.isEmpty()) {
            Event conflictEvent = conflicts.get(0).getEvent();
            throw new RuntimeException(
                    "Bạn đã đăng ký sự kiện '" + conflictEvent.getTitle()
                            + "' trùng thời gian với sự kiện này"
            );
        }

        Optional<EventRegistration> existingReg = registrationRepository
                .findByEventIdAndParticipantAccountId(eventId, userRegistrationId);

        EventRegistration registration;

        if (existingReg.isPresent()) {
            registration = existingReg.get();
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                throw new RuntimeException("Bạn đã đăng ký sự kiện này rồi");
            }
        } else {
            registration = new EventRegistration();
            registration.setEvent(event);
//            registration.setUserRegistrationId(userRegistrationId);
        }

        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setCheckedIn(false);

        String qrToken = qrTokenUtil.generateQRToken(
                userRegistrationId, eventId, event.getEndTime()
        );

        registration.setQrToken(qrToken);
        registration.setQrTokenExpiry(qrTokenUtil.getExpiryFromToken(qrToken));

        return registrationRepository.save(registration);
    }

    @Override
    public RegistrationResponseDto getRegistrationWithQR(String registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

//        if (!qrTokenUtil.isTokenValid(registration.getQrToken())) {
//            String newToken = qrTokenUtil.generateQRToken(
//                    registration.getUserRegistrationId(),
//                    registration.getEvent().getId(),
//                    registration.getEvent().getEndTime()
//            );
//            registration.setQrToken(newToken);
//            registration.setQrTokenExpiry(qrTokenUtil.getExpiryFromToken(newToken));
//            registrationRepository.save(registration);
//        }

        return toDto(registration);
    }

    @Transactional
    @Override
    public CheckInResponse checkIn(CheckInRequest request) {
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

        EventRegistration registration = registrationRepository
                .findByEventIdAndParticipantAccountId(eventId, userId)
                .orElse(null);

        if (registration == null) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("User chưa đăng ký sự kiện này")
                    .build();
        }

        if (!request.getQrToken().equals(registration.getQrToken())) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("QR code không khớp")
                    .build();
        }

        if (registration.isCheckedIn()) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("User đã check-in trước đó lúc " + registration.getCheckInTime())
                    .build();
        }

        Event event = registration.getEvent();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime checkInOpen = event.getStartTime().minusMinutes(30);
        LocalDateTime checkInClose = event.getEndTime();

        if (now.isBefore(checkInOpen)) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Chưa đến giờ check-in. Mở check-in lúc " + checkInOpen)
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
//        registration.setCheckInByAccountId(request.getAdminAccountId());
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
//        registration.setCheckInByAccountId(adminAccountId);
        registration.setStatus(RegistrationStatus.ATTENDED);

        registrationRepository.save(registration);

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in thủ công thành công!")
//                .userProfileId(registration.getUserRegistrationId())
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
        return registrationRepository.findByParticipantAccountId(userProfileId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private RegistrationResponseDto toDto(EventRegistration r) {
        return RegistrationResponseDto.builder()
                .id(r.getId())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .eventStartTime(r.getEvent().getStartTime() != null ? r.getEvent().getStartTime().toString() : null)
                .eventEndTime(r.getEvent().getEndTime() != null ? r.getEvent().getEndTime().toString() : null)
                .eventLocation(r.getEvent().getLocation())
//                .userProfileId(r.getUserRegistrationId())
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
                .findByEventIdAndParticipantAccountId(eventId, userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        if (registration.isCheckedIn()) {
            throw new RuntimeException("Không thể hủy vì đã check-in rồi");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        return registrationRepository.save(registration);
    }
}