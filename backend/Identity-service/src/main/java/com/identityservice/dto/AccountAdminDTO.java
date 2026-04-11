package com.identityservice.dto;

import com.identityservice.entity.AccountStatus;
import com.identityservice.entity.Role;

public record AccountAdminDTO(
        String id,
        String username,
        String email,
        String fullName,
        Role role,
        AccountStatus status,
        String createdAt
) {
}