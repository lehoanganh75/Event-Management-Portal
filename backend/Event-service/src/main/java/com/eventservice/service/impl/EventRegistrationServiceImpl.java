package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.UserDto;
import com.eventservice.repository.EventParticipantRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import com.eventservice.entity.EventOrganizer;
import com.eventservice.repository.EventOrganizerRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.eventservice.dto.CheckInRequest;
import com.eventservice.dto.CheckInResponse;
import com.eventservice.dto.RegistrationResponseDto;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventRegistration;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.RegistrationStatus;
import com.eventservice.repository.EventRegistrationRepository;
import com.eventservice.repository.EventRepository;
import com.eventservice.service.EventRegistrationService;
import com.eventservice.util.QRTokenUtil;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final EventOrganizerRepository organizerRepository;
    private final QRTokenUtil qrTokenUtil;
    private final IdentityServiceClient identityServiceClient;

    private String resolveEventId(String idOrSlug) {
        if (idOrSlug == null) return null;
        // If it's a UUID (36 chars), return as is
        if (idOrSlug.length() == 36 && idOrSlug.contains("-")) return idOrSlug;
        
        return eventRepository.findBySlug(idOrSlug)
                .map(Event::getId)
                .orElse(idOrSlug);
    }

    @Override
    public Optional<EventRegistration> findByEventIdAndUserRegistrationId(String eventId, String userRegistrationId) {
        return registrationRepository.findByEventIdAndParticipantAccountId(eventId, userRegistrationId);
    }

    @Override
    public EventRegistration registerForEvent(String idOrSlug, String userId) {
        String eventId = resolveEventId(idOrSlug);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        // 2. Kiểm tra hạn đăng ký
        if (event.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đã quá hạn đăng ký sự kiện này");
        }

        // 3. Kiểm tra số lượng người tham gia tối đa
        if (event.getRegisteredCount() >= event.getMaxParticipants()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sự kiện đã hết chỗ");
        }

        // 4. Kiểm tra xem user đã đăng ký chưa (tránh đăng ký trùng)
        if (registrationRepository.existsByEventIdAndParticipantAccountIdAndIsDeletedFalse(eventId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đăng ký sự kiện này rồi");
        }

        // 4.1 Kiểm tra trùng lịch (với các sự kiện đã đăng ký)
        List<EventRegistration> regConflicts = registrationRepository.findConflictingRegistrations(
                userId, event.getStartTime(), event.getEndTime(), eventId, RegistrationStatus.REGISTERED);
        if (!regConflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bạn đã đăng ký sự kiện '" + regConflicts.get(0).getEvent().getTitle() + "' trùng thời gian.");
        }

        // 4.2 Kiểm tra trùng lịch (với các sự kiện đang tham gia ban tổ chức)
        List<EventOrganizer> orgConflicts = organizerRepository.findConflictingOrganizers(
                userId, event.getStartTime(), event.getEndTime(), eventId);
        if (!orgConflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bạn đang trong ban tổ chức sự kiện '" + orgConflicts.get(0).getEvent().getTitle() + "' trùng thời gian.");
        }

        // 5. Tạo mã vé (VD: TITLE-001)
        long currentCount = registrationRepository.countByEventId(eventId) + 1;
        String ticketCode = String.format("%s-%04d", event.getSlug().toUpperCase(), currentCount);

        // 6. Khởi tạo đối tượng đăng ký
        String qrToken = qrTokenUtil.generateQRToken(userId, eventId, event.getEndTime());
        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .participantAccountId(userId)
                .status(RegistrationStatus.REGISTERED) // Chuyển thẳng sang REGISTERED nếu tự đăng ký
                .ticketCode(ticketCode)
                .qrToken(qrToken)
                .qrTokenExpiry(qrTokenUtil.getExpiryFromToken(qrToken))
                .build();

        // 7. Cập nhật số lượng người đã đăng ký vào bảng Event
        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepository.save(event);

        return registrationRepository.save(registration);
    }

    @Transactional
    @Override
    public EventRegistration registerUserToEvent(String eventId, String userRegistrationId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        if (event.getStatus() != EventStatus.PUBLISHED
                && event.getStatus() != EventStatus.ONGOING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sự kiện không mở đăng ký");
        }

        if (event.getRegistrationDeadline() != null
                && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đã hết hạn đăng ký sự kiện này");
        }

        long registeredCount = registrationRepository
                .findByEventIdAndStatus(eventId, RegistrationStatus.REGISTERED).size();

        if (event.getMaxParticipants() > 0 && registeredCount >= event.getMaxParticipants()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sự kiện đã đủ số lượng tham gia");
        }

        List<EventRegistration> conflicts = registrationRepository.findConflictingRegistrations(
                userRegistrationId, event.getStartTime(), event.getEndTime(), eventId, RegistrationStatus.REGISTERED);

        if (!conflicts.isEmpty()) {
            Event conflictEvent = conflicts.get(0).getEvent();
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bạn đã đăng ký sự kiện '" + conflictEvent.getTitle()
                            + "' trùng thời gian với sự kiện này");
        }

        // Kiểm tra trùng lịch với ban tổ chức
        List<EventOrganizer> orgConflicts = organizerRepository.findConflictingOrganizers(
                userRegistrationId, event.getStartTime(), event.getEndTime(), eventId);
        if (!orgConflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bạn đang trong ban tổ chức sự kiện '" + orgConflicts.get(0).getEvent().getTitle()
                            + "' trùng thời gian với sự kiện này");
        }

        Optional<EventRegistration> existingReg = registrationRepository
                .findByEventIdAndParticipantAccountId(eventId, userRegistrationId);

        EventRegistration registration;

        if (existingReg.isPresent()) {
            registration = existingReg.get();
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đăng ký sự kiện này rồi");
            }
        } else {
            registration = new EventRegistration();
            registration.setEvent(event);
            registration.setParticipantAccountId(userRegistrationId);

            // Tạo mã vé (VD: TITLE-001)
            long currentCount = registrationRepository.countByEventId(event.getId()) + 1;
            String ticketCode = String.format("%s-%04d", event.getSlug().toUpperCase(), currentCount);
            registration.setTicketCode(ticketCode);
        }

        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setCheckedIn(false);

        String qrToken = qrTokenUtil.generateQRToken(
                userRegistrationId, eventId, event.getEndTime());

        registration.setQrToken(qrToken);
        registration.setQrTokenExpiry(qrTokenUtil.getExpiryFromToken(qrToken));

        return registrationRepository.save(registration);
    }

    @Override
    public RegistrationResponseDto getRegistrationWithQR(String registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

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
        String eventIdFromToken = claims.get("eventId", String.class);
        String eventId = resolveEventId(eventIdFromToken);

        // Use lock to prevent concurrent scans of the same QR
        EventRegistration registration = registrationRepository
                .findWithLockByEventIdAndUserId(eventId, userId)
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
        registration.setStatus(RegistrationStatus.ATTENDED);

        registrationRepository.save(registration);

        String fullName = registration.getFullName();
        String avatarUrl = registration.getAvatarUrl();

        // Try to get from participant if not in registration
        if (fullName == null || avatarUrl == null) {
            participantRepository.findByEventIdAndParticipantAccountId(eventId, userId)
                .ifPresent(p -> {
                    registration.setFullName(p.getFullName());
                    registration.setAvatarUrl(p.getAvatarUrl());
                });
            fullName = registration.getFullName();
            avatarUrl = registration.getAvatarUrl();
        }

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in thành công!")
                .userProfileId(userId)
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .eventId(eventId)
                .eventTitle(event.getTitle())
                .checkInTime(now.toString())
                .build();
    }

    @Transactional
    @Override
    public CheckInResponse manualCheckIn(String registrationId, String adminAccountId) {
        // Use lock for consistency
        EventRegistration registration = registrationRepository.findWithLockById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đăng ký"));

        if (registration.isCheckedIn()) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("User đã check-in trước đó")
                    .build();
        }

        registration.setCheckedIn(true);
        registration.setCheckInTime(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.ATTENDED);

        registrationRepository.save(registration);

        String fullName = registration.getFullName();
        String avatarUrl = registration.getAvatarUrl();

        if (fullName == null || avatarUrl == null) {
            participantRepository.findByEventIdAndParticipantAccountId(registration.getEvent().getId(), registration.getParticipantAccountId())
                .ifPresent(p -> {
                    registration.setFullName(p.getFullName());
                    registration.setAvatarUrl(p.getAvatarUrl());
                });
            fullName = registration.getFullName();
            avatarUrl = registration.getAvatarUrl();
        }

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in thủ công thành công!")
                .userProfileId(registration.getParticipantAccountId())
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .eventId(registration.getEvent().getId())
                .eventTitle(registration.getEvent().getTitle())
                .checkInTime(registration.getCheckInTime().toString())
                .build();
    }

    @Override
    public List<RegistrationResponseDto> getRegistrationsByEvent(String idOrSlug) {
        log.info("getRegistrationsByEvent called with: {}", idOrSlug);
        
        // Find the event first to get its canonical UUID
        Event event = eventRepository.findById(idOrSlug)
                .or(() -> eventRepository.findBySlug(idOrSlug))
                .orElse(null);
        
        if (event == null) {
            log.warn("Could not find event by ID or Slug: {}", idOrSlug);
            return Collections.emptyList();
        }
        
        String eventId = event.getId();
        log.info("Resolved event to UUID: {} (Title: {})", eventId, event.getTitle());

        List<EventRegistration> registrations = registrationRepository.findByEvent(event);
        log.info("Found {} registrations for event: {}", registrations.size(), event.getTitle());
        log.info("Found {} registrations for eventId: {}", registrations.size(), eventId);
        
        if (registrations.isEmpty()) return Collections.emptyList();

        // Batch fetch user info from Identity Service
        List<String> userIds = registrations.stream()
                .map(EventRegistration::getParticipantAccountId)
                .distinct()
                .collect(Collectors.toList());
        log.info("Batch fetching profiles for {} unique users", userIds.size());

        Map<String, UserDto> userMap = new HashMap<>();
        try {
            List<UserDto> users = identityServiceClient.getUsersByIds(userIds);
            if (users != null) {
                log.info("Successfully fetched {} profiles from Identity Service", users.size());
                userMap = users.stream().collect(Collectors.toMap(UserDto::getId, u -> u));
            }
        } catch (Exception e) {
            log.error("Failed to fetch user profiles for registrations: {}", e.getMessage());
        }

        Map<String, UserDto> finalUserMap = userMap;
        return registrations.stream()
                .map(r -> {
                    RegistrationResponseDto dto = toDto(r);
                    UserDto user = finalUserMap.get(r.getParticipantAccountId());
                    if (user != null) {
                        dto.setFullName(user.getFullName());
                        dto.setAvatarUrl(user.getAvatarUrl());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDto> getRegistrationsByUser(String userProfileId) {
        List<EventRegistration> registrations = registrationRepository.findByParticipantAccountId(userProfileId);
        if (registrations.isEmpty()) return Collections.emptyList();

        // Since it's for a single user, we can fetch once
        UserDto user = null;
        try {
            user = identityServiceClient.getUsersById(userProfileId);
        } catch (Exception e) {
            log.error("Failed to fetch user profile for registrations: {}", e.getMessage());
        }

        UserDto finalUser = user;
        return registrations.stream()
                .map(r -> {
                    RegistrationResponseDto dto = toDto(r);
                    if (finalUser != null) {
                        dto.setFullName(finalUser.getFullName());
                        dto.setAvatarUrl(finalUser.getAvatarUrl());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private RegistrationResponseDto toDto(EventRegistration r) {
        return RegistrationResponseDto.builder()
                .id(r.getId())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .userProfileId(r.getParticipantAccountId())
                .eventStartTime(r.getEvent().getStartTime() != null ? r.getEvent().getStartTime().toString() : null)
                .eventEndTime(r.getEvent().getEndTime() != null ? r.getEvent().getEndTime().toString() : null)
                .eventLocation(r.getEvent().getLocation())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .registeredAt(r.getRegisteredAt() != null ? r.getRegisteredAt().toString() : null)
                .qrToken(r.getQrToken())
                .qrTokenExpiry(r.getQrTokenExpiry() != null ? r.getQrTokenExpiry().toString() : null)
                .checkedIn(r.isCheckedIn())
                .checkInTime(r.getCheckInTime() != null ? r.getCheckInTime().toString() : null)
                .ticketCode(r.getTicketCode())
                .fullName(r.getFullName()) // Might be transient, will be overriden by batch fetch if needed
                .avatarUrl(r.getAvatarUrl())
                .build();
    }

    @Transactional
    @Override
    public EventRegistration cancelRegistration(String eventId, String userProfileId) {
        EventRegistration registration = registrationRepository
                .findByEventIdAndParticipantAccountId(eventId, userProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin đăng ký"));

        if (registration.isCheckedIn()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể hủy vì bạn đã thực hiện check-in rồi");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        EventRegistration saved = registrationRepository.save(registration);

        // Đồng bộ xóa mềm bên bảng EventParticipant (nếu có)
        participantRepository.findByEventIdAndParticipantAccountId(eventId, userProfileId)
                .ifPresent(p -> {
                    p.setDeleted(true);
                    participantRepository.save(p);
                });

        return saved;
    }

    @Transactional
    @Override
    public RegistrationResponseDto getTicketForUser(String idOrSlug, String currentUserId) {
        String eventId = idOrSlug;
        if (idOrSlug.length() < 36) {
            eventId = eventRepository.findBySlug(idOrSlug)
                    .map(Event::getId)
                    .orElse(idOrSlug);
        }

        EventRegistration registration = registrationRepository
                .findByEventIdAndParticipantAccountIdAndIsDeletedFalse(eventId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy vé hoặc bạn không có quyền truy cập vé này"));
        
        RegistrationResponseDto dto = toDto(registration);
        
        // Populate user info for ticket
        try {
            UserDto user = identityServiceClient.getUsersById(currentUserId);
            if (user != null) {
                dto.setFullName(user.getFullName());
                dto.setAvatarUrl(user.getAvatarUrl());
            }
        } catch (Exception e) {
            log.error("Failed to fetch user profile for ticket: {}", e.getMessage());
        }
        
        return dto;
    }

    @Transactional
    @Override
    public CheckInResponse undoCheckIn(String registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đăng ký"));

        if (!registration.isCheckedIn()) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Người này chưa thực hiện check-in")
                    .build();
        }

        registration.setCheckedIn(false);
        registration.setCheckInTime(null);
        registration.setCheckedInByAccountId(null);
        registrationRepository.save(registration);

        return CheckInResponse.builder()
                .success(true)
                .message("Đã hủy trạng thái check-in thành công")
                .build();
    }

    @Transactional
    @Override
    public CheckInResponse updateCheckInTime(String registrationId, java.time.LocalDateTime newTime, String adminAccountId) {
        EventRegistration registration = registrationRepository.findWithLockById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đăng ký"));

        if (!registration.isCheckedIn()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Người này chưa thực hiện check-in");
        }

        registration.setCheckInTime(newTime);
        registrationRepository.save(registration);

        String fullName = registration.getFullName();
        String avatarUrl = registration.getAvatarUrl();
        if (fullName == null || avatarUrl == null) {
            participantRepository.findByEventIdAndParticipantAccountId(registration.getEvent().getId(), registration.getParticipantAccountId())
                .ifPresent(p -> {
                    registration.setFullName(p.getFullName());
                    registration.setAvatarUrl(p.getAvatarUrl());
                });
            fullName = registration.getFullName();
            avatarUrl = registration.getAvatarUrl();
        }

        return CheckInResponse.builder()
                .success(true)
                .message("Cập nhật thời gian điểm danh thành công")
                .userProfileId(registration.getParticipantAccountId())
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .checkInTime(newTime.toString())
                .build();
    }

    @Override
    public CheckInResponse getEventQRToken(String idOrSlug) {
        String eventId = resolveEventId(idOrSlug);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        String token = qrTokenUtil.generateEventQRToken(event.getId(), event.getEndTime(), event.getQrType());
        return CheckInResponse.builder().success(true).token(token).build();
    }

    @Transactional
    @Override
    public void updateEventQRType(String idOrSlug, String qrType) {
        String eventId = resolveEventId(idOrSlug);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));
        event.setQrType(qrType);
        eventRepository.save(event);
    }

    @Transactional
    @Override
    public CheckInResponse checkInByEventToken(String eventToken, String userId) {
        Claims claims;
        try {
            claims = qrTokenUtil.verifyQRToken(eventToken);
        } catch (Exception e) {
            return CheckInResponse.builder().success(false).message("Mã QR sự kiện không hợp lệ hoặc đã hết hạn").build();
        }

        Boolean isEventToken = claims.get("isEventToken", Boolean.class);
        if (isEventToken == null || !isEventToken) {
            return CheckInResponse.builder().success(false).message("Đây không phải là mã QR của sự kiện").build();
        }

        String eventId = claims.get("eventId", String.class);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        // 1. Kiểm tra xem điểm danh có đang được bật không
        if (!event.isCheckInEnabled()) {
            return CheckInResponse.builder().success(false).message("Điểm danh hiện đang bị đóng bởi Ban tổ chức").build();
        }

        // 2. Kiểm tra thời gian (Cho phép trước 30p và trong khi diễn ra)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime checkInOpen = event.getStartTime().minusMinutes(30);
        LocalDateTime checkInClose = event.getEndTime();

        if (now.isBefore(checkInOpen)) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Chưa đến giờ điểm danh. Hệ thống mở lúc " + checkInOpen.toLocalTime())
                    .build();
        }

        if (now.isAfter(checkInClose)) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Sự kiện đã kết thúc, không thể điểm danh")
                    .build();
        }

        EventRegistration registration = registrationRepository
                .findWithLockByEventIdAndUserId(eventId, userId)
                .orElse(null);

        if (registration == null) {
            return CheckInResponse.builder().success(false).message("Bạn chưa đăng ký sự kiện này").build();
        }

        if (registration.isCheckedIn()) {
            return CheckInResponse.builder().success(false).message("Bạn đã điểm danh rồi").build();
        }

        registration.setCheckedIn(true);
        registration.setCheckInTime(now);
        registration.setStatus(RegistrationStatus.ATTENDED);
        registrationRepository.save(registration);

        return CheckInResponse.builder()
                .success(true)
                .message("Điểm danh thành công!")
                .fullName(registration.getFullName())
                .checkInTime(now.toString())
                .build();
    }

    @Transactional
    @Override
    public void toggleCheckInEnabled(String idOrSlug, boolean enabled) {
        String eventId = resolveEventId(idOrSlug);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));
        
        event.setCheckInEnabled(enabled);
        eventRepository.save(event);
    }
}