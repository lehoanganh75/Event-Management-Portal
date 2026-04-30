package com.identityservice.service;

import com.identityservice.dto.auth.request.LoginRequest;
import com.identityservice.dto.auth.request.RegisterRequest;
import com.identityservice.dto.auth.response.AuthResponse;

import java.util.Map;

public interface AuthService {
    Map<String, String> register(RegisterRequest request);
    Map<String, String> checkEmailVerification(String token);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    Map<String, String> verifyMobileOTP(String otp, String username);
    void resendOtp(String username);
    AuthResponse refreshToken(String refreshToken);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    void changePassword(String userId, String oldPassword, String newPassword);
}
