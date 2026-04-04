package com.eventservice.service;

public interface EmailService {
    void sendEventInviteEmailAsync(String targetEmail, String inviteUrl, String eventName, String fullName);
}
