package com.eventservice.service;

public interface EmailService {
    void sendEventInviteEmailAsync(String targetEmail, String inviteUrl, String eventName, String fullName, 
                                  String startTime, String endTime, String location, String description);
}
