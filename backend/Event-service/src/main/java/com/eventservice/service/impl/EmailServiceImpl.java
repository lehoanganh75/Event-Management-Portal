package com.eventservice.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import com.eventservice.constant.RedisConstant;
import com.eventservice.service.EmailService;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Override
    public void sendEventInviteEmailAsync(String targetEmail, String inviteUrl, String eventName, String fullName,
                                  String startTime, String endTime, String location, String description) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("eventName", eventName);
            context.setVariable("inviteUrl", inviteUrl);
            context.setVariable("startTime", startTime);
            context.setVariable("endTime", endTime);
            context.setVariable("location", location);
            context.setVariable("description", description);
            context.setVariable("expirySeconds", RedisConstant.INVITE_EXPIRY_SECONDS);

            String html = templateEngine.process("email/event-invite", context);

            helper.setTo(targetEmail);
            helper.setSubject("[IUH EVENT] Lời mời tham gia: " + eventName);
            helper.setText(html, true);

            mailSender.send(message);
            System.out.println("Event invite email sent to " + targetEmail);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send event invite email to " + targetEmail, e);
        }
    }
}
