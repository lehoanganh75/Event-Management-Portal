package src.main.authservice.dto;

import lombok.*;

@Data
public class RefreshRequest {
    private String refreshToken;
}