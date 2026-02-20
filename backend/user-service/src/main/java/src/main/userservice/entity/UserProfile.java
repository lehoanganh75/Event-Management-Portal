package src.main.userservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String accountId;
    private String organizationId;

    private String loginCode;
    private String fullName;
    private String gender;
    private LocalDateTime birthDate;
    private String majorName;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

