package src.main.authservice.service;

import src.main.authservice.dto.AuthResponse;
import src.main.authservice.dto.LoginRequest;
import src.main.authservice.dto.RegisterRequest;

import java.util.Map;

public interface AuthService {
    Map<String, String> register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String token);
    void sendVerificationEmailAsync(String toEmail, String verificationUrl, String fullName);
    Map<String, String> checkEmailVerification(String token);
}
