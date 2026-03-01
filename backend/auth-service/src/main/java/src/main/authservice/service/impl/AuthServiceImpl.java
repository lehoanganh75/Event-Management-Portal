package src.main.authservice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import src.main.authservice.client.UserClient;
import src.main.authservice.dto.AuthResponse;
import src.main.authservice.dto.UserTokenInfo;
import src.main.authservice.dto.LoginRequest;
import src.main.authservice.dto.RegisterRequest;
import src.main.authservice.entity.*;
import src.main.authservice.exception.*;
import src.main.authservice.repository.AccountRepository;
import src.main.authservice.repository.RefreshTokenRepository;
import src.main.authservice.repository.VerificationTokenRepository;
import src.main.authservice.service.AuthService;
import src.main.authservice.util.JwtUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserClient userClient;
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${zerobounce.api.key}")
    private String zeroBounceApiKey;

    @Override
    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        Map<String, String> response = new HashMap<>();

        validateRegistration(request);
        
        if (!isRealEmail(request.getEmail())) {
            throw new EmailNotExistsException("Email không tồn tại hoặc không hợp lệ.");
        }

        Account account = createPendingAccount(request);
        Account savedAccount = accountRepository.save(account);

        // Tạo verification token
        String token = UUID.randomUUID().toString();
        String verificationUrl = "http://localhost:8081/api/auth/verify?token=" + token;

        VerificationToken vToken = createVerificationToken(savedAccount, request, token);
        verificationTokenRepository.save(vToken);

        // Gửi email async (không chặn request)
        sendVerificationEmailAsync(request.getEmail(), verificationUrl, request.getFullName());

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
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail());
        assignRolesByEmail(account, request.getEmail());
        account.setStatus(AccountStatus.PENDING);
        account.setCreatedAt(LocalDateTime.now());
        return account;
    }

    private VerificationToken createVerificationToken(Account account, RegisterRequest request, String token) {
        VerificationToken vToken = new VerificationToken();
        vToken.setToken(token);
        vToken.setAccount(account);
        vToken.setFullName(request.getFullName());
        vToken.setDateOfBirth(request.getDateOfBirth());
        vToken.setGender(request.getGender());
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
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
                System.out.println("ZeroBounce check for" + email + " : " + deliverability);
                return "deliverable".equalsIgnoreCase(deliverability);
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
        return true;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Account account = (Account) accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Username không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new InvalidCredentialsException("Password không đúng");
        }

        if (account.getStatus() == AccountStatus.PENDING) {
            throw new AccountNotActivatedException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận.");
        }

        String userProfileId = userClient.getUserProfileIdByAccountId(account.getId());

        UserTokenInfo info = new UserTokenInfo();
        info.setUserName(account.getUsername());
        info.setAccountId(account.getId());
        info.setEmail(account.getEmail());
        info.setRoles(account.getRoles());
        info.setUserProfileId(userProfileId);

        String accessToken = jwtUtils.generateToken(info);

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
                .orElseThrow(() -> new RefreshTokenNotFoundException("Refresh token không tồn tại hoặc không hợp lệ."));

        if (refreshToken.isRevoked()) {
            throw new RefreshTokenRevokedException("Refresh token đã bị thu hồi. Vui lòng đăng nhập lại.");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new RefreshTokenExpiredException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }

        Account account = refreshToken.getAccount();
        String userProfileId = userClient.getUserProfileIdByAccountId(account.getId());

        UserTokenInfo info = new UserTokenInfo();
        info.setUserName(account.getUsername());
        info.setAccountId(account.getId());
        info.setRoles(account.getRoles());
        info.setUserProfileId(userProfileId);

        String newAccessToken = jwtUtils.generateToken(info);

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

        Map<String, String> kafkaMessage = new HashMap<>();
        kafkaMessage.put("accountId", account.getId());
        kafkaMessage.put("fullName", verificationToken.getFullName());
        kafkaMessage.put("gender", verificationToken.getGender());
        kafkaMessage.put("dateOfBirth", verificationToken.getDateOfBirth().toString());
        kafkaTemplate.send("user-registration-topic", kafkaMessage);

        verificationTokenRepository.delete(verificationToken);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Xác nhận email thành công! Bạn đã có thể đăng nhập.");

        return response;
    }
}