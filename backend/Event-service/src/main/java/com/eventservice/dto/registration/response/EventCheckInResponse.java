package com.eventservice.dto.registration.response;

import com.eventservice.dto.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCheckInResponse {
    private boolean success;
    private String message;
    private String userProfileId;
    
    // Composition: Nhúng profile thay cho các trường rời rạc
    private UserResponse profile;
    
    private String eventId;
    private String eventTitle;
    private String checkInTime;
    private String token;
}
