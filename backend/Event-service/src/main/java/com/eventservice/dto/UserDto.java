package com.eventservice.dto;

import lombok.Data;

@Data
public class UserDto {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String email;
    private String phone;
    private String role;
    private String bio;
}