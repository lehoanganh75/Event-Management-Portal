package com.identityservice.dto.request;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String username;
    private String otp;
}
