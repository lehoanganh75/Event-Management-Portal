package src.main.authservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String token;

    @OneToOne
    @JoinColumn(name = "account_id")
    private Account account;

    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;

    private LocalDateTime expiryDate;

    private boolean used = false;
}
