package src.main.authservice.dto;

import lombok.*;
import src.main.authservice.entity.Role;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private String username;
    private Set<Role> roles;
}