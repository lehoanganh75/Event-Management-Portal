package src.main.authservice.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private Set<String> roles;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
}