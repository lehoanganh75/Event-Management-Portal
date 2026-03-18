package src.main.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String entityType;
    private String entityId;
    private String action;
    private String performedByAccountId;
    @CreationTimestamp
    private LocalDateTime performedAt;
}