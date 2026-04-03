package src.main.identityservice.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.identityservice.dto.response.AuthResponse;
import src.main.identityservice.dto.request.LoginRequest;
import src.main.identityservice.dto.request.RegisterRequest;
import src.main.identityservice.exception.TokenExpiredException;
import src.main.identityservice.exception.TokenInvalidException;
import src.main.identityservice.exception.TokenUsedException;
import src.main.identityservice.service.AuthService;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent().build();
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

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgot(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok("Mã khôi phục đã được gửi tới email của bạn.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> reset(@RequestParam String token, @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
    }
}
