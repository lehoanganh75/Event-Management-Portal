package com.identityservice.service.impl;

import com.identityservice.entity.*;
import com.identityservice.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.identityservice.dto.response.AuthResponse;
import com.identityservice.dto.request.LoginRequest;
import com.identityservice.dto.request.RegisterRequest;
import com.identityservice.dto.UserPrincipal;
import com.identityservice.repository.AccountRepository;
import com.identityservice.repository.PasswordResetTokenRepository;
import com.identityservice.repository.RefreshTokenRepository;
import com.identityservice.repository.VerificationTokenRepository;
import com.identityservice.service.AuthService;
import com.identityservice.service.EmailService;
import com.identityservice.util.JwtUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthServiceImpl implements AuthService {
    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthServiceImpl(AccountRepository accountRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           VerificationTokenRepository verificationTokenRepository,
                           JwtUtils jwtUtils,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this.accountRepository = accountRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Value("${server.port}")
    private String PORT;

    @Override
    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại.");
        }
        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng.");
        }

        if (!isRealEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email không tồn tại hoặc không hợp lệ.");
        }

        Account account = createPendingAccount(request);

        User userRegister = createUserRegister(request);

        userRegister.setAccount(account);

        account.setUser(userRegister);

        Account savedAccount = accountRepository.save(account);

        String otp = String.valueOf(new Random().nextInt(899999) + 100000);

        VerificationToken vToken = createVerificationToken(savedAccount, otp);
        // Lưu ý: Đảm bảo setExpiryDate ngắn thôi (ví dụ: 5 phút) vì OTP cần nhanh
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationTokenRepository.save(vToken);

        // 5. Gửi Email chứa mã OTP
        emailService.sendOtpEmail(request.getEmail(), otp, request.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Mã xác thực OTP đã được gửi vào Email của bạn.");
        return response;
    }

    private Account createPendingAccount(RegisterRequest request) {
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail());
        assignRolesByEmail(account, request.getEmail());
        account.setCreatedAt(LocalDateTime.now());
        return account;
    }

    private User createUserRegister(RegisterRequest request) {
        User userRegister = new User();
        userRegister.setFullName(request.getFullName());
        userRegister.setGender(request.getGender());
        userRegister.setDateOfBirth(request.getDateOfBirth());
        return userRegister;
    }

    private VerificationToken createVerificationToken(Account account, String token) {
        VerificationToken vToken = new VerificationToken();
        vToken.setToken(token);
        vToken.setAccount(account);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        vToken.setUsed(false);
        return vToken;
    }

    private boolean isRealEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(regex);
    }

    public void assignRolesByEmail(Account account, String email) {
        Role role;
        String domain = email.substring(email.indexOf("@"));
        switch (domain) {
            case "@iuh.edu.vn":
                role = Role.ADMIN;
                break;
            case "@student.iuh.edu.vn":
                role = Role.MEMBER;
                break;
            default:
                role = Role.GUEST;
                break;
        }
        account.setRole(role);
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

        Account account = verificationToken.getAccount();
        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);

        verificationTokenRepository.delete(verificationToken);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Xác nhận email thành công! Bạn đã có thể đăng nhập.");
        return response;
    }

    @Override
    @Transactional
    public Map<String, String> verifyMobileOTP(String otp, String username) {
        // 1. Tìm token dựa trên mã OTP và username (để đảm bảo chính chủ)
        VerificationToken verificationToken = verificationTokenRepository.findByTokenAndAccount_Username(otp, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác hoặc đã hết hạn"));

        // 2. Kiểm tra hết hạn
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(verificationToken);
            throw new ResponseStatusException(HttpStatus.GONE, "Mã OTP đã hết hạn");
        }

        // 3. Kích hoạt tài khoản
        Account account = verificationToken.getAccount();
        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);

        // 4. Xóa token sau khi dùng
        verificationTokenRepository.delete(verificationToken);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Xác thực OTP thành công!");
        return response;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Username không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Password không đúng");
        }

        if (account.getStatus() == AccountStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận.");
        }

        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        String profileId = (account.getUser() != null) ? account.getUser().getId() : null;
        System.out.println(profileId);

        UserPrincipal principal = new UserPrincipal();
        principal.setAccountId(account.getId());
        principal.setRole(account.getRole());

        String accessToken = jwtUtils.generateAccessToken(principal);

        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setAccount(account);
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(7)); // Hết hạn sau 7 ngày
        refreshToken.setRevoked(false);
        refreshToken.setUsed(false);

        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(accessToken, refreshTokenStr);
    }

    @Override
    @Transactional
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Refresh Token không tồn tại hoặc không hợp lệ."));

        if (refreshToken.isRevoked() || refreshToken.isUsed()) {
            System.out.println("Cố gắng đăng xuất bằng token đã vô hiệu hóa: {}");
            return;
        }

        refreshToken.setRevoked(true);
        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    @Override
    public void forgotPassword(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Email không tồn tại trong hệ thống."));

        passwordResetTokenRepository.deleteByAccount(account);

        // 3. Tạo token mới (UUID)
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setAccount(account);
        resetToken.setExpiryDate(new Date(System.currentTimeMillis() + 15 * 60 * 1000).toInstant().atZone(TimeZone.getDefault().toZoneId()).toLocalDateTime());
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        // 4. Gửi email (Async)
        String resetUrl = "http://localhost:5173/reset-password?token=" + token; // Link trỏ về Frontend
        emailService.sendResetPasswordEmailAsync(email, resetUrl, account.getUser().getFullName());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 1. Tìm và kiểm tra token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Mã khôi phục không hợp lệ."));

        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã khôi phục đã hết hạn hoặc đã được sử dụng.");
        }

        // 2. Cập nhật mật khẩu mới cho Account
        Account account = resetToken.getAccount();
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        // 3. Đánh dấu token đã dùng
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        System.out.println("Mật khẩu của tài khoản " + account.getUsername() + " đã được thay đổi thành công.");
    }

    @Override
    @Transactional
    public void resendOtp(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập không tồn tại."));

        if (account.getStatus() == AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản đã được kích hoạt.");
        }

        // Xóa mã cũ
        verificationTokenRepository.deleteByAccount(account);

        // Tạo mã mới
        String otp = String.valueOf(new Random().nextInt(899999) + 100000);
        VerificationToken vToken = createVerificationToken(account, otp);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationTokenRepository.save(vToken);

        // Gửi email mới
        emailService.sendOtpEmail(account.getEmail(), otp, account.getUser().getFullName());
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

        Account account = refreshToken.getAccount();
        UserPrincipal principal = new UserPrincipal(account.getId(), account.getRole());
        String newAccessToken = jwtUtils.generateAccessToken(principal);

        // Đánh dấu token cũ đã sử dụng
        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);

        // Tạo refresh token mới (Rotation)
        String newRefreshTokenStr = UUID.randomUUID().toString();
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenStr);
        newRefreshToken.setAccount(account);
        newRefreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        newRefreshToken.setRevoked(false);
        newRefreshToken.setUsed(false);
        refreshTokenRepository.save(newRefreshToken);

        return new AuthResponse(newAccessToken, newRefreshTokenStr);
    }

    @Override
    public boolean existsByEmail(String email) {
        return accountRepository.findByEmail(email).isPresent();
    }

    @Override
    public boolean existsByUsername(String username) {
        return accountRepository.findByUsername(username).isPresent();
    }
}
