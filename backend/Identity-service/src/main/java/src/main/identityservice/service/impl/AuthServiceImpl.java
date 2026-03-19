package src.main.identityservice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import src.main.identityservice.dto.AuthResponse;
import src.main.identityservice.dto.LoginRequest;
import src.main.identityservice.dto.RegisterRequest;
import src.main.identityservice.dto.UserPrincipal;
import src.main.identityservice.entity.*;
import src.main.identityservice.exception.*;
import src.main.identityservice.repository.AccountRepository;
import src.main.identityservice.repository.PasswordResetTokenRepository;
import src.main.identityservice.repository.RefreshTokenRepository;
import src.main.identityservice.repository.VerificationTokenRepository;
import src.main.identityservice.service.AuthService;
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

    @Value("${zerobounce.api.key}")
    private String zeroBounceApiKey;

    @Value("${server.port}")
    private String PORT;

    @Override
    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        validateRegistration(request);

        if (!isRealEmail(request.getEmail())) {
            throw new EmailNotExistsException("Email không tồn tại hoặc không hợp lệ.");
        }

        Account account = createPendingAccount(request);

        User userProfile = new User();
        userProfile.setFullName(request.getFullName());
        userProfile.setGender(request.getGender());
        userProfile.setDateOfBirth(request.getDateOfBirth());

        userProfile.setAccount(account);
        account.setUserProfile(userProfile);

        Account savedAccount = accountRepository.save(account);

        // Tạo verification token
        String token = UUID.randomUUID().toString();
        VerificationToken vToken = createVerificationToken(savedAccount, token);
        verificationTokenRepository.save(vToken);

        // Gửi email async (không chặn request)
        String verificationUrl = "http://localhost:" + PORT + "/api/auth/verify?token=" + token;
        sendVerificationEmailAsync(request.getEmail(), verificationUrl, request.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư (bao gồm thư rác/spam).");
        response.put("timestamp", String.valueOf(LocalDateTime.now()));
        return response;
    }

    private void validateRegistration(RegisterRequest request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UsernameAlreadyExistsException("Tên đăng nhập đã tồn tại.");
        }
        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email đã được sử dụng.");
        }
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

    private VerificationToken createVerificationToken(Account account, String token) {
        VerificationToken vToken = new VerificationToken();
        vToken.setToken(token);
        vToken.setAccount(account);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        vToken.setUsed(false);
        return vToken;
    }

    @Async
    public void sendVerificationEmailAsync(String toEmail, String verificationUrl, String fullName) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("verificationUrl", verificationUrl);
            context.setVariable("logoUrl", "https://i.imgur.com/YourLogoHere.png"); // Thay bằng link thật

            String html = templateEngine.process("email/verification-email", context);

            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đăng ký tài khoản - Event Management System");
            helper.setText(html, true);

            mailSender.send(message);
            System.out.println("Đã gửi email xác nhận đến: " + toEmail);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email xác nhận. Vui lòng thử lại sau.", e);
        }
    }

    private boolean isRealEmail(String email) {
        if (email == null || email.trim().isEmpty()) return false;

        RestTemplate restTemplate = new RestTemplate();

        String url = "https://emailreputation.abstractapi.com/v1/?api_key=" + zeroBounceApiKey + "&email=" + email;

        try {
            ResponseEntity<JsonNode> apiResponse = restTemplate.getForEntity(url, JsonNode.class);
            if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
                String deliverability = apiResponse.getBody().get("email_deliverability").get("status").asText();
                System.out.println("ZeroBounce check for " + email + " : " + deliverability);
                return "deliverable".equalsIgnoreCase(deliverability);
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
        return true;
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
        Account account = (Account) accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Username không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new InvalidCredentialsException("Password không đúng");
        }

        if (account.getStatus() == AccountStatus.PENDING) {
            throw new AccountNotActivatedException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận.");
        }

        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        String profileId = (account.getUserProfile() != null) ? account.getUserProfile().getId() : null;
        System.out.println(profileId);

        UserPrincipal principal = new UserPrincipal();
        principal.setAccountId(account.getId());
        principal.setUserName(account.getUsername());
        principal.setEmail(account.getEmail());
        principal.setRoles(account.getRoles());
        principal.setUserId(profileId);

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
        sendResetPasswordEmailAsync(email, resetUrl, account.getUserProfile().getFullName());
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
