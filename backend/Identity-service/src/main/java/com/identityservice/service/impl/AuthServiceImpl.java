package com.identityservice.service.impl;

import com.identityservice.dto.auth.request.LoginRequest;
import com.identityservice.dto.auth.request.RegisterRequest;
import com.identityservice.dto.auth.response.AuthResponse;
import com.identityservice.dto.auth.UserPrincipal;
import com.identityservice.entity.*;
import com.identityservice.repository.UserRepository;
import com.identityservice.repository.PasswordResetTokenRepository;
import com.identityservice.repository.RefreshTokenRepository;
import com.identityservice.repository.VerificationTokenRepository;
import com.identityservice.service.AuthService;
import com.identityservice.service.EmailService;
import com.identityservice.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng.");
        }
        if (!isRealEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email không tồn tại hoặc không hợp lệ.");
        }

        User user = createUser(request);
        User savedUser = userRepository.save(user);

        String otp = String.valueOf(new Random().nextInt(899999) + 100000);
        VerificationToken vToken = createVerificationToken(savedUser, otp);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationTokenRepository.save(vToken);

        emailService.sendOtpEmail(request.getEmail(), otp, request.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Mã xác thực OTP đã được gửi vào Email của bạn.");
        return response;
    }

    private User createUser(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        assignRolesByEmail(user, request.getEmail());
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    private VerificationToken createVerificationToken(User user, String token) {
        VerificationToken vToken = new VerificationToken();
        vToken.setToken(token);
        vToken.setUser(user);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        vToken.setUsed(false);
        return vToken;
    }

    private boolean isRealEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(regex);
    }

    public void assignRolesByEmail(User user, String email) {
        Role role;
        String domain = email.substring(email.indexOf("@")).toLowerCase();
        switch (domain) {
            case "@iuh.edu.vn":
                role = Role.ADMIN;
                break;
            case "@student.iuh.edu.vn":
                role = Role.STUDENT;
                break;
            default:
                role = Role.GUEST;
                break;
        }
        user.setRole(role);
    }

    @Override
    public Map<String, String> checkEmailVerification(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Token không hợp lệ hoặc đã hết hạn"));

        if (verificationToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Token đã được sử dụng");
        }
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Token đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        verificationTokenRepository.delete(verificationToken);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Xác nhận email thành công! Bạn đã có thể đăng nhập.");
        return response;
    }

    @Override
    @Transactional
    public Map<String, String> verifyMobileOTP(String otp, String username) {
        VerificationToken verificationToken = verificationTokenRepository.findByTokenAndUser_Username(otp, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác hoặc đã hết hạn"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(verificationToken);
            throw new ResponseStatusException(HttpStatus.GONE, "Mã OTP đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        verificationTokenRepository.delete(verificationToken);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Xác thực OTP thành công!");
        return response;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameAndIsDeletedFalse(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Username không tồn tại hoặc đã bị xóa"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Password không đúng");
        }
        if (user.getStatus() == AccountStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận.");
        }
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.");
        }


        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal();
        principal.setUserId(user.getId());
        principal.setRole(user.getRole());
        String accessToken = jwtUtils.generateAccessToken(principal);

        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshToken.setRevoked(false);
        refreshToken.setUsed(false);
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .build();
    }

    @Override
    @Transactional
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Refresh Token không tồn tại hoặc không hợp lệ."));

        if (refreshToken.isRevoked() || refreshToken.isUsed()) {
            return;
        }
        refreshToken.setRevoked(true);
        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Email không tồn tại hoặc tài khoản đã bị xóa."));

        passwordResetTokenRepository.deleteByUser(user);
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendResetPasswordEmailAsync(email, resetUrl, user.getFullName());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Mã khôi phục không hợp lệ."));

        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã khôi phục đã hết hạn hoặc đã được sử dụng.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void resendOtp(String username) {
        User user = userRepository.findByUsernameAndIsDeletedFalse(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập không tồn tại hoặc tài khoản đã bị xóa."));

        if (user.getStatus() == AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản đã được kích hoạt.");
        }

        verificationTokenRepository.deleteByUser(user);
        String otp = String.valueOf(new Random().nextInt(899999) + 100000);
        VerificationToken vToken = createVerificationToken(user, otp);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationTokenRepository.save(vToken);

        emailService.sendOtpEmail(user.getEmail(), otp, user.getFullName());
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh Token không tồn tại"));

        if (refreshToken.isRevoked() || refreshToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh Token đã bị vô hiệu hóa hoặc đã được sử dụng");
        }
        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh Token đã hết hạn");
        }

        User user = refreshToken.getUser();
        if (user == null || user.isDeleted() || user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa, vô hiệu hóa hoặc bị xóa");
        }
        UserPrincipal principal = new UserPrincipal(user.getId(), user.getRole());
        String newAccessToken = jwtUtils.generateAccessToken(principal);

        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);

        String newRefreshTokenStr = UUID.randomUUID().toString();
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenStr);
        newRefreshToken.setUser(user);
        newRefreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        newRefreshToken.setRevoked(false);
        newRefreshToken.setUsed(false);
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .build();
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional
    public void changePassword(String userId, String oldPassword, String newPassword) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại."));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
