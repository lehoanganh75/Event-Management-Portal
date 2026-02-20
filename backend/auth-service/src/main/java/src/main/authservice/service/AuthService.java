package src.main.authservice.service;

import src.main.authservice.dto.AuthResponse;
import src.main.authservice.dto.LoginRequest;
import src.main.authservice.dto.RegisterRequest;
import src.main.authservice.entity.Account;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String token);
    void logout(String accountId);
    Account register(RegisterRequest request);
}
