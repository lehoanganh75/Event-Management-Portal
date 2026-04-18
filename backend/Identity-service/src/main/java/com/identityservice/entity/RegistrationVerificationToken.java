package com.identityservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registration_verification_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private boolean used = false;

    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
}
