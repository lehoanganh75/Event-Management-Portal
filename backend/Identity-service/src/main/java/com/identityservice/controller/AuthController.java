package com.identityservice.controller;

import com.identityservice.dto.request.LogoutRequest;
import com.identityservice.dto.request.VerifyOtpRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.identityservice.dto.response.AuthResponse;
import com.identityservice.dto.request.LoginRequest;
import com.identityservice.dto.request.RegisterRequest;
import com.identityservice.service.AuthService;

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

        } catch (Exception e) {
            String errorMsg = URLEncoder.encode("Có lỗi hệ thống. Vui lòng thử lại.", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/login?verified=false&error=" + errorMsg);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyMobileOTP(@RequestBody VerifyOtpRequest request) {
        String otp = request.getOtp();
        String username = request.getUsername();

        Map<String, String> result = authService.verifyMobileOTP(otp, username);
        return ResponseEntity.ok(result);
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
