package src.main.identityservice.service;

import src.main.identityservice.dto.AuthResponse;
import src.main.identityservice.dto.LoginRequest;
import src.main.identityservice.dto.RegisterRequest;

import java.util.Map;

public interface AuthService {
    Map<String, String> register(RegisterRequest request);
    Map<String, String> checkEmailVerification(String token);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}
