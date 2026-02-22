package src.main.authservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "account_roles", joinColumns = @JoinColumn(name = "account_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name")
    private Set<Role> roles;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RefreshToken> refreshTokens;
}
