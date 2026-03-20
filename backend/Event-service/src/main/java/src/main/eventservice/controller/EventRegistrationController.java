package src.main.eventservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.dto.CheckInRequest;
import src.main.eventservice.dto.CheckInResponse;
import src.main.eventservice.dto.RegistrationResponseDto;
import src.main.eventservice.service.EventRegistrationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class EventRegistrationController {
    private final EventRegistrationService registrationService;

    @PostMapping("/{eventId}/register")
    public ResponseEntity<?> register(
            @PathVariable String eventId,
            @RequestParam String userProfileId) {
        try {
            RegistrationResponseDto dto = registrationService.register(eventId, userProfileId);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{registrationId}/qr")
    public ResponseEntity<?> getQR(@PathVariable String registrationId) {
        try {
            RegistrationResponseDto dto = registrationService.getRegistrationWithQR(registrationId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/check-in")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        CheckInResponse response = registrationService.checkIn(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/{registrationId}/manual-check-in")
    public ResponseEntity<CheckInResponse> manualCheckIn(
            @PathVariable String registrationId,
            @RequestParam String adminAccountId) {
        CheckInResponse response = registrationService.manualCheckIn(registrationId, adminAccountId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponseDto>> getByEvent(
            @PathVariable String eventId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByEvent(eventId));
    }

    @GetMapping("/user/{userProfileId}")
    public ResponseEntity<List<RegistrationResponseDto>> getByUser(
            @PathVariable String userProfileId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUser(userProfileId));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> check(
            @RequestParam String eventId,
            @RequestParam String userProfileId) {
        return ResponseEntity.ok(Map.of(
                "registered", registrationService.isRegistered(eventId, userProfileId)
        ));
    }

    @PatchMapping("/cancel")
    public ResponseEntity<?> cancelRegistration(
            @RequestParam String eventId,
            @RequestParam String userProfileId) {
        try {
            RegistrationResponseDto dto = registrationService.cancelRegistration(eventId, userProfileId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
