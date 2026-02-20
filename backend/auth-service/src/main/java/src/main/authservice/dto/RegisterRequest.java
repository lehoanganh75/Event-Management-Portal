package src.main.authservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email; // Có thể mở rộng thêm
    private String role;  // Mặc định thường là MEMBER
}