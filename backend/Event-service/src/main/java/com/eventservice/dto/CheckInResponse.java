package com.eventservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckInResponse {
    private boolean success;
    private String message;
    private String userProfileId;
    private String fullName;
    private String avatarUrl;
    private String eventId;
    private String eventTitle;
    private String checkInTime;
    private String token;
}