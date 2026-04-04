package src.main.identityservice.dto.request;

import lombok.Getter;
import lombok.Setter;
import src.main.identityservice.entity.Gender;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
}
