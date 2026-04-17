package com.identityservice.service;

import com.identityservice.dto.response.AuthResponse;
import com.identityservice.dto.request.LoginRequest;
import com.identityservice.dto.request.RegisterRequest;

import java.util.Map;

public interface AuthService {
    Map<String, String> register(RegisterRequest request);
    Map<String, String> checkEmailVerification(String token);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    Map<String, String> verifyMobileOTP(String otp, String username);
}
