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
import org.springframework.scheduling.annotation.Async;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Async
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
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send event invite email to " + targetEmail, e);
        }
    }

    @Async
    @Override
    public void sendPresenterInviteEmailAsync(String targetEmail, String inviteUrl, String eventName, String fullName,
                                             String startTime, String sessionTopic) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("eventName", eventName);
            context.setVariable("inviteUrl", inviteUrl);
            context.setVariable("startTime", startTime);
            context.setVariable("sessionTopic", sessionTopic != null ? sessionTopic : "Toàn bộ sự kiện");

            String html = templateEngine.process("email/presenter-invite", context);

            helper.setTo(targetEmail);
            helper.setSubject("[IUH EVENT] Lời mời thuyết trình tại sự kiện: " + eventName);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send presenter invite email to " + targetEmail, e);
        }
    }
}
