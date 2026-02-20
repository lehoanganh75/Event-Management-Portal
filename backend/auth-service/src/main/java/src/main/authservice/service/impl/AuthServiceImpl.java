package src.main.authservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import src.main.authservice.dto.AuthResponse;
import src.main.authservice.dto.LoginRequest;
import src.main.authservice.dto.RegisterRequest;
import src.main.authservice.entity.Account;
import src.main.authservice.repository.AccountRepository;
import src.main.authservice.service.AuthService;
import src.main.authservice.util.JwtUtils;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public AuthResponse login(LoginRequest request) {
        Account acc = accountRepository.findByUsername(request.getUsername())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Logic validatePassword từ sơ đồ
        if (!passwordEncoder.matches(request.getPassword(), acc.getPassword())) {
            throw new RuntimeException("Wrong password!");
        }

        String token = jwtUtils.generateToken(acc);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setTokenType(token);
        return authResponse;
    }

    @Override
    public AuthResponse refreshToken(String token) {
        return null;
    }

    @Override
    public void logout(String accountId) {

    }

    @Override
    public Account register(RegisterRequest request) {
        return null;
    }
}