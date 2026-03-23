package src.main.eventservice.service;

import jakarta.transaction.Transactional;
import src.main.eventservice.dto.CheckInRequest;
import src.main.eventservice.dto.CheckInResponse;
import src.main.eventservice.dto.RegistrationResponseDto;
import src.main.eventservice.entity.EventRegistration;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationService {
    Optional<EventRegistration> findByEventIdAndUserRegistrationId(String eventId, String userRegistrationId);
    EventRegistration registerUserToEvent(String eventId, String userRegistrationId);
    RegistrationResponseDto getRegistrationWithQR(String registrationId);
    CheckInResponse checkIn(CheckInRequest request);
    CheckInResponse manualCheckIn(String registrationId, String adminAccountId);
    List<RegistrationResponseDto> getRegistrationsByEvent(String eventId);
    List<RegistrationResponseDto> getRegistrationsByUser(String userProfileId);

    EventRegistration cancelRegistration(String eventId, String userProfileId);
}