package com.identityservice.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import com.identityservice.service.EmailService;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    @Async
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("otp", otp); // Truyền mã OTP vào template
            context.setVariable("logoUrl", "https://i.imgur.com/YourLogoHere.png"); // Link logo IUH của bạn

            // Sử dụng template mới (hoặc cập nhật template cũ)
            String html = templateEngine.process("email/verification-email", context);

            helper.setTo(toEmail);
            helper.setSubject("[IUH Event] Mã xác thực đăng ký tài khoản"); // Tiêu đề chuyên nghiệp hơn
            helper.setText(html, true);

            mailSender.send(message);
            System.out.println("Đã gửi OTP đến: " + toEmail);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi mã xác thực. Vui lòng thử lại sau.", e);
        }
    }

    @Override
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
