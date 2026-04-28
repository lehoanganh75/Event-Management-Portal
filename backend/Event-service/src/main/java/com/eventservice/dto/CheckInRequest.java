package com.eventservice.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private String qrToken;
    private String adminAccountId;
}