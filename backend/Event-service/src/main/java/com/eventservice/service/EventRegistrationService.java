package com.eventservice.service;

import com.eventservice.dto.CheckInRequest;
import com.eventservice.dto.CheckInResponse;
import com.eventservice.dto.RegistrationResponseDto;
import com.eventservice.entity.EventRegistration;

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