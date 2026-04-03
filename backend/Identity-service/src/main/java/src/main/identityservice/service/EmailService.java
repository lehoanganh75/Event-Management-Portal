package src.main.identityservice.service;

public interface EmailService {
    void sendVerificationEmail(String toEmail, String verificationUrl, String fullName);
}
