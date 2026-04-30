package com.identityservice.controller;

import com.identityservice.dto.auth.request.*;
import com.identityservice.dto.auth.response.AuthResponse;
import com.identityservice.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.existsByEmail(email));
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(authService.existsByUsername(username));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok("Đăng xuất thành công.");
    }

    @GetMapping("/verify")
    public void verifyToken(@RequestParam String token, HttpServletResponse response) throws IOException {
        try {
            Map<String, String> result = authService.checkEmailVerification(token);
            String redirectUrl = "http://localhost:5173/login?verified=true&message=" +
                    URLEncoder.encode(result.get("message"), StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            String errorMsg = URLEncoder.encode("Có lỗi hệ thống. Vui lòng thử lại.", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/login?verified=false&error=" + errorMsg);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyMobileOTP(@RequestBody VerifyOtpRequest request) {
        Map<String, String> result = authService.verifyMobileOTP(request.getOtp(), request.getUsername());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String username) {
        authService.resendOtp(username);
        return ResponseEntity.ok("Mã xác thực OTP mới đã được gửi vào Email của bạn.");
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

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        String userId = jwt.getSubject();
        authService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
    }
}
