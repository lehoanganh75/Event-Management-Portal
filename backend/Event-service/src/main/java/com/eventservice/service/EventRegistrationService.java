package com.eventservice.service;

import com.eventservice.dto.registration.request.EventCheckInRequest;
import com.eventservice.dto.registration.response.EventCheckInResponse;
import com.eventservice.dto.registration.response.EventRegistrationResponse;
import com.eventservice.entity.registration.EventRegistration;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationService {
    Optional<EventRegistration> findByEventIdAndUserRegistrationId(String eventId, String userRegistrationId);

    EventRegistration registerForEvent(String eventId, String userId);

    EventRegistration registerUserToEvent(String eventId, String userRegistrationId);

    EventRegistrationResponse getRegistrationWithQR(String registrationId);

    EventCheckInResponse checkIn(EventCheckInRequest request);

    EventCheckInResponse manualCheckIn(String registrationId, String adminAccountId);

    List<EventRegistrationResponse> getRegistrationsByEvent(String eventId);

    List<EventRegistrationResponse> getRegistrationsByUser(String userProfileId);

    EventRegistration cancelRegistration(String eventId, String userProfileId);

    EventRegistrationResponse getTicketForUser(String eventId, String currentUserId);
    EventCheckInResponse undoCheckIn(String registrationId);
    EventCheckInResponse updateCheckInTime(String registrationId, java.time.LocalDateTime newTime, String adminAccountId);

    EventCheckInResponse getEventQRToken(String eventId);
    EventCheckInResponse checkInByEventToken(String eventToken, String userId);
    void toggleCheckInEnabled(String eventId, boolean enabled);
    void updateEventQRType(String eventId, String qrType);
}
