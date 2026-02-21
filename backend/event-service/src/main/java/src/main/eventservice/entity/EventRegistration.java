package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.RegistrationStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations")
@Getter
@Setter
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    @OneToOne(mappedBy = "eventRegistration", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    private String userProfileId;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    private LocalDateTime registeredAt;

    private boolean eligibleForDraw;
    private LocalDateTime drawEntries;
}
