package com.eventservice.dto.registration.request;

import lombok.Data;

@Data
public class EventCheckInRequest {
    private String qrToken;
    private String adminAccountId;
}
