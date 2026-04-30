package com.eventservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.eventservice.dto.registration.request.EventCheckInRequest;
import com.eventservice.dto.registration.response.EventCheckInResponse;
import com.eventservice.dto.registration.response.EventRegistrationResponse;
import com.eventservice.entity.registration.EventRegistration;
import com.eventservice.service.EventRegistrationService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class EventRegistrationController {
    private final EventRegistrationService registrationService;

    @GetMapping("/{eventId}")
    public ResponseEntity<EventRegistrationResponse> getTicket(
            @PathVariable String eventId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = jwt.getSubject();

        EventRegistrationResponse ticket = registrationService.getTicketForUser(eventId, currentUserId);

        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/register/{eventId}")
    public ResponseEntity<EventRegistration> register(
            @PathVariable String eventId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        EventRegistration result = registrationService.registerForEvent(eventId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // ====================================================

    @GetMapping("/check/{eventId}")
    public ResponseEntity<Optional<EventRegistration>> findByEventIdAndUserRegistrationId(
            @PathVariable String eventId,
            @AuthenticationPrincipal Jwt jwt) {
        String userRegistrationId = jwt.getSubject();
        return ResponseEntity.ok().body(registrationService.findByEventIdAndUserRegistrationId(eventId, userRegistrationId));
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<EventRegistration> registerUserToEvent(
            @PathVariable String eventId,
            @AuthenticationPrincipal Jwt jwt) {
        String userRegistrationId = jwt.getSubject();
        EventRegistration result = registrationService.registerUserToEvent(eventId, userRegistrationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{registrationId}/qr")
    public ResponseEntity<?> getQR(@PathVariable String registrationId) {
        try {
            EventRegistrationResponse dto = registrationService.getRegistrationWithQR(registrationId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/check-in")
    public ResponseEntity<EventCheckInResponse> checkIn(@RequestBody EventCheckInRequest request) {
        EventCheckInResponse response = registrationService.checkIn(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/{registrationId}/manual-check-in")
    public ResponseEntity<EventCheckInResponse> manualCheckIn(
            @PathVariable String registrationId,
            @RequestParam String adminAccountId) {
        EventCheckInResponse response = registrationService.manualCheckIn(registrationId, adminAccountId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventRegistrationResponse>> getByEvent(
            @PathVariable String eventId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByEvent(eventId));
    }

    @GetMapping("/user/{userProfileId}")
    public ResponseEntity<List<EventRegistrationResponse>> getByUser(
            @PathVariable String userProfileId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUser(userProfileId));
    }

    @PatchMapping("/cancel/{eventId}")
    public ResponseEntity<EventRegistration> cancelRegistration(
            @PathVariable String eventId,
            @AuthenticationPrincipal Jwt jwt) {

        String userRegistrationId = jwt.getSubject();
        return ResponseEntity.ok(registrationService.cancelRegistration(eventId, userRegistrationId));
    }

    @PostMapping("/{registrationId}/undo-check-in")
    public ResponseEntity<EventCheckInResponse> undoCheckIn(@PathVariable String registrationId) {
        EventCheckInResponse response = registrationService.undoCheckIn(registrationId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PutMapping("/{registrationId}/check-in-time")
    public ResponseEntity<EventCheckInResponse> updateCheckInTime(
            @PathVariable String registrationId,
            @RequestParam String newTime,
            @AuthenticationPrincipal Jwt jwt) {
        String adminAccountId = jwt.getSubject();
        java.time.LocalDateTime time = java.time.LocalDateTime.parse(newTime);
        EventCheckInResponse response = registrationService.updateCheckInTime(registrationId, time, adminAccountId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/event/{eventId}/qr-token")
    public ResponseEntity<EventCheckInResponse> getEventQRToken(@PathVariable String eventId) {
        return ResponseEntity.ok(registrationService.getEventQRToken(eventId));
    }

    @PostMapping("/check-in/event")
    public ResponseEntity<EventCheckInResponse> checkInByEventToken(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt) {
        String token = request.get("token");
        String userId = jwt.getSubject();
        EventCheckInResponse response = registrationService.checkInByEventToken(token, userId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PatchMapping("/event/{eventId}/toggle-check-in")
    public ResponseEntity<Void> toggleCheckIn(
            @PathVariable String eventId,
            @RequestParam boolean enabled) {
        registrationService.toggleCheckInEnabled(eventId, enabled);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/event/{eventId}/qr-type")
    public ResponseEntity<Void> updateQRType(
            @PathVariable String eventId,
            @RequestParam String qrType) {
        registrationService.updateEventQRType(eventId, qrType);
        return ResponseEntity.ok().build();
    }
}
