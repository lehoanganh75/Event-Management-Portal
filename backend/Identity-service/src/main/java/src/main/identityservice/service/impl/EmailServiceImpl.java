package src.main.identityservice.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import src.main.identityservice.service.EmailService;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    @Async
    public void sendVerificationEmail(String toEmail, String verificationUrl, String fullName) {
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
}
