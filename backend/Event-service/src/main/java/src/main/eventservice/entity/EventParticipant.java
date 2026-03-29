package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import src.main.eventservice.entity.enums.ParticipationStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"event", "hibernateLazyInitializer", "handler"})
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonBackReference
    private Event event;

    private String fullName;
    private String email;

    private String title;
    private String position;
    private String department;
    private String organization;

    private String code;

    @Enumerated(EnumType.STRING)
    private ParticipationStatus status;

    private LocalDateTime registeredAt;
    private LocalDateTime attendedAt;

    private boolean checkedIn;
    private String checkedInBy;
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;
}