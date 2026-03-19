package src.main.eventservice.controller;

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
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventRegistrationController {

    @Autowired
    private EventRegistrationService registrationService;

    @PostMapping("/events/{eventId}/register")
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

    @GetMapping("/registrations/{registrationId}/qr")
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

    @PostMapping("/registrations/{registrationId}/manual-check-in")
    public ResponseEntity<CheckInResponse> manualCheckIn(
            @PathVariable String registrationId,
            @RequestParam String adminAccountId) {
        CheckInResponse response = registrationService.manualCheckIn(registrationId, adminAccountId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/registrations/event/{eventId}")
    public ResponseEntity<List<RegistrationResponseDto>> getByEvent(
            @PathVariable String eventId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByEvent(eventId));
    }

    @GetMapping("/registrations/user/{userProfileId}")
    public ResponseEntity<List<RegistrationResponseDto>> getByUser(
            @PathVariable String userProfileId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUser(userProfileId));
    }

    @GetMapping("/registrations/check")
    public ResponseEntity<Map<String, Boolean>> check(
            @RequestParam String eventId,
            @RequestParam String userProfileId) {
        return ResponseEntity.ok(Map.of(
                "registered", registrationService.isRegistered(eventId, userProfileId)
        ));
    }

    @PatchMapping("/registrations/cancel")
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
