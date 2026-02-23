package src.main.userservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreatedEvent {
    private String accountId;
    private String fullName;
    private String email;
    private String gender;
    private LocalDate dateOfBirth;
}