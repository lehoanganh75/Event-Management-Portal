package src.main.identityservice.dto;

import java.util.List;

public record AccountAdminDTO(
        String id,
        String username,
        String email,
        String fullName,
        List<String> roles,
        String status,
        String createdAt
) {
}