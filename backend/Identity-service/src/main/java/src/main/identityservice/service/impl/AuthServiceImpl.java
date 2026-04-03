package src.main.identityservice.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import src.main.identityservice.dto.response.AuthResponse;
import src.main.identityservice.dto.request.LoginRequest;
import src.main.identityservice.dto.request.RegisterRequest;
import src.main.identityservice.dto.UserPrincipal;
import src.main.identityservice.entity.*;
import src.main.identityservice.exception.*;
import src.main.identityservice.repository.AccountRepository;
import src.main.identityservice.repository.PasswordResetTokenRepository;
import src.main.identityservice.repository.RefreshTokenRepository;
import src.main.identityservice.repository.VerificationTokenRepository;
import src.main.identityservice.service.AuthService;
import src.main.identityservice.service.EmailService;
import src.main.identityservice.util.JwtUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSenderImpl mailSender;
    private final SpringTemplateEngine templateEngine;

    private final EmailService emailService;

    @Value("${zerobounce.api.key}")
    private String zeroBounceApiKey;

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

        String token = UUID.randomUUID().toString();
        VerificationToken vToken = createVerificationToken(savedAccount, token);
        verificationTokenRepository.save(vToken);

        String verificationUrl = "http://localhost:" + PORT + "/auth/verify?token=" + token;
        emailService.sendVerificationEmail(request.getEmail(), verificationUrl, request.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư (bao gồm thư rác/spam).");
        response.put("timestamp", String.valueOf(LocalDateTime.now()));
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
                .orElseThrow(() -> new TokenInvalidException("Token không hợp lệ hoặc đã hết hạn"));

        if (verificationToken.isUsed()) {
            throw new TokenUsedException("Token đã được sử dụng");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Token đã hết hạn");
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
    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Username không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new InvalidCredentialsException("Password không đúng");
        }

        if (account.getStatus() == AccountStatus.PENDING) {
            throw new AccountNotActivatedException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận.");
        }

        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        String profileId = (account.getUser() != null) ? account.getUser().getId() : null;
        System.out.println(profileId);

        UserPrincipal principal = new UserPrincipal();
        principal.setAccountId(account.getId());
        principal.setRole(account.getRole());

        String accessToken = jwtUtils.generateToken(principal);

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
                .orElseThrow(() -> new TokenInvalidException("Refresh Token không tồn tại hoặc không hợp lệ."));

        if (refreshToken.isRevoked() || refreshToken.isUsed()) {
            System.out.println("Cố gắng đăng xuất bằng token đã vô hiệu hóa: {}");
            return;
        }

        refreshToken.setRevoked(true);
        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotExistsException("Email không tồn tại trong hệ thống."));

        passwordResetTokenRepository.deleteByAccount(account);

        // 3. Tạo token mới (UUID)
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setAccount(account);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15)); // Hết hạn sau 15p
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        // 4. Gửi email (Async)
        String resetUrl = "http://localhost:5173/reset-password?token=" + token; // Link trỏ về Frontend
        sendResetPasswordEmailAsync(email, resetUrl, account.getUser().getFullName());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 1. Tìm và kiểm tra token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Mã khôi phục không hợp lệ."));

        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã khôi phục đã hết hạn hoặc đã được sử dụng.");
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

    @Async
    public void sendResetPasswordEmailAsync(String toEmail, String resetUrl, String fullName) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("resetUrl", resetUrl);

            String html = templateEngine.process("email/reset-password-email", context);

            helper.setTo(toEmail);
            helper.setSubject("Khôi phục mật khẩu - Event Management System");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.out.println("Lỗi gửi mail reset password: " + e.getMessage());
        }
    }
}
