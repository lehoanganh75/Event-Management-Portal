package src.main.identityservice.dto;

import src.main.identityservice.entity.AccountStatus;
import src.main.identityservice.entity.Role;

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