package com.eventservice.dto.user;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String email;
    private String bio;
    private String phone;
}
