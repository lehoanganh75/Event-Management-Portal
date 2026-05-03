package com.eventservice.dto.registration.response;

import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.registration.EventRegistration;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationResponse {
        private String id;
        private String eventId;
        private String eventTitle;
        private String status;
        private Map<String, Object> answersJson;
        private String registeredAt;
        private String updatedAt;
        private String qrToken;
        private String qrTokenExpiry;
        private boolean checkedIn;
        private String checkInTime;

        private String eventStartTime;
        private String eventEndTime;
        private String eventLocation;

        // Composition: Thông tin chi tiết từ Identity Service
        private UserResponse profile;
        private UserResponse checkedInBy;

        private String ticketCode;

        public static EventRegistrationResponse from(EventRegistration registration,
                        UserResponse profile,
                        UserResponse checkedInBy) {
                if (registration == null)
                        return null;
                return EventRegistrationResponse.builder()
                                .id(registration.getId())
                                .eventId(registration.getEvent() != null ? registration.getEvent().getId() : null)
                                .eventTitle(registration.getEvent() != null ? registration.getEvent().getTitle() : null)
                                .status(registration.getStatus() != null ? registration.getStatus().name() : null)
                                .answersJson(registration.getAnswersJson())
                                .registeredAt(registration.getRegisteredAt() != null
                                                ? registration.getRegisteredAt().toString()
                                                : null)
                                .updatedAt(registration.getUpdatedAt() != null ? registration.getUpdatedAt().toString()
                                                : null)
                                .qrToken(registration.getQrToken())
                                .qrTokenExpiry(
                                                registration.getQrTokenExpiry() != null
                                                                ? registration.getQrTokenExpiry().toString()
                                                                : null)
                                .checkedIn(registration.isCheckedIn())
                                .checkInTime(registration.getCheckInTime() != null
                                                ? registration.getCheckInTime().toString()
                                                : null)
                                .eventStartTime(registration.getEvent() != null
                                                && registration.getEvent().getStartTime() != null
                                                                ? registration.getEvent().getStartTime().toString()
                                                                : null)
                                .eventEndTime(registration.getEvent() != null
                                                && registration.getEvent().getEndTime() != null
                                                                ? registration.getEvent().getEndTime().toString()
                                                                : null)
                                .eventLocation(registration.getEvent() != null ? registration.getEvent().getLocation()
                                                : null)
                                .profile(profile)
                                .checkedInBy(checkedInBy)
                                .ticketCode(registration.getTicketCode())
                                .build();
        }
}
