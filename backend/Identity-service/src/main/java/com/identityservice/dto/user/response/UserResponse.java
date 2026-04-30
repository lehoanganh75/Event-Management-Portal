package com.identityservice.dto.user.response;

import com.identityservice.entity.AccountStatus;
import com.identityservice.entity.Gender;
import com.identityservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String phone;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String bio;
    private Role role;
    private AccountStatus status;
    private LocalDateTime createdAt;
}