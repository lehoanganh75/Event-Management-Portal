package src.main.eventservice.service;

import jakarta.transaction.Transactional;
import src.main.eventservice.dto.CheckInRequest;
import src.main.eventservice.dto.CheckInResponse;
import src.main.eventservice.dto.RegistrationResponseDto;

import java.util.List;

public interface EventRegistrationService {
    RegistrationResponseDto register(String eventId, String userProfileId);
    RegistrationResponseDto getRegistrationWithQR(String registrationId);
    CheckInResponse checkIn(CheckInRequest request);
    CheckInResponse manualCheckIn(String registrationId, String adminAccountId);
    List<RegistrationResponseDto> getRegistrationsByEvent(String eventId);
    List<RegistrationResponseDto> getRegistrationsByUser(String userProfileId);
    boolean isRegistered(String eventId, String userProfileId);

    @Transactional
    RegistrationResponseDto cancelRegistration(String eventId, String userProfileId);
}