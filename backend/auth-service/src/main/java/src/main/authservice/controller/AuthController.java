package src.main.authservice.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.authservice.dto.AuthResponse;
import src.main.authservice.dto.LoginRequest;
import src.main.authservice.dto.RefreshRequest;
import src.main.authservice.dto.RegisterRequest;
import src.main.authservice.exception.TokenExpiredException;
import src.main.authservice.exception.TokenInvalidException;
import src.main.authservice.exception.TokenUsedException;
import src.main.authservice.service.AuthService;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        Map<String, String> response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token.substring(7));
        return ResponseEntity.ok("Logged out successfully!");
    }

    @GetMapping("/verify")
    public void verifyToken(@RequestParam String token, HttpServletResponse response) throws IOException {
        try {
            Map<String, String> result = authService.checkEmailVerification(token);

            // Thành công → redirect về login với thông báo success
            String redirectUrl = "http://localhost:5173/login?verified=true&message=" +
                    URLEncoder.encode(result.get("message"), StandardCharsets.UTF_8);

            response.sendRedirect(redirectUrl);

        } catch (TokenInvalidException | TokenUsedException | TokenExpiredException e) {
            // Lỗi token → redirect về login với thông báo lỗi
            String errorMsg = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            String redirectUrl = "http://localhost:5173/login?verified=false&error=" + errorMsg;

            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            // Lỗi khác
            String errorMsg = URLEncoder.encode("Có lỗi hệ thống. Vui lòng thử lại.", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/login?verified=false&error=" + errorMsg);
        }
    }
}