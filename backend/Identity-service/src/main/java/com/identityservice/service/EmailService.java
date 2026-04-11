package com.identityservice.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String verificationUrl, String fullName);
    void sendResetPasswordEmailAsync(String toEmail, String resetUrl, String fullName);
}
