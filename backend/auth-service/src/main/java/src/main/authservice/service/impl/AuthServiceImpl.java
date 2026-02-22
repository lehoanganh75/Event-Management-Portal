package src.main.authservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.authservice.dto.AuthResponse;
import src.main.authservice.dto.LoginRequest;
import src.main.authservice.dto.RegisterRequest;
import src.main.authservice.entity.Account;
import src.main.authservice.entity.AccountStatus;
import src.main.authservice.entity.RefreshToken;
import src.main.authservice.entity.Role;
import src.main.authservice.repository.AccountRepository;
import src.main.authservice.repository.RefreshTokenRepository;
import src.main.authservice.service.AuthService;
import src.main.authservice.util.JwtUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public Account register(RegisterRequest request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail());

        assignRolesByEmail(account, request.getEmail());

        account.setStatus(AccountStatus.Active);
        account.setCreatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Account account = (Account) accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Tạo Access Token
        String accessToken = jwtUtils.generateToken(account);

        // Tạo Refresh Token
        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setAccount(account);
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);

        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshTokenStr);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtUtils.getExpiration() / 1000);
        response.setUsername(account.getUsername());
        response.setRoles(account.getRoles());

        return response;
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        Account account = refreshToken.getAccount();
        String newAccessToken = jwtUtils.generateToken(account);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(token);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtUtils.getExpiration() / 1000);
        response.setUsername(account.getUsername());
        response.setRoles(account.getRoles());

        return response;
    }

    @Override
    @Transactional
    public void logout(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }

    public void assignRolesByEmail(Account account, String email) {
        Set<Role> roles = new HashSet<>();
        String domain = email.substring(email.indexOf("@"));

        switch (domain) {
            case "@iuh.edu.vn":
                roles.add(Role.ADMIN);
                break;
            case "@student.iuh.edu.vn":
                roles.add(Role.EVENT_PARTICIPANT);
                break;
            default:
                roles.add(Role.GUEST);
                break;
        }
        account.setRoles(roles);
    }
}