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

    private String userRegistrationId;
    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private boolean eligibleForDraw;
    private LocalDateTime drawEntries;
    @Column(name = "qr_token", length = 2048)
    private String qrToken;
    private LocalDateTime qrTokenExpiry;
    private boolean checkedIn = false;
    private LocalDateTime checkInTime;
    private String checkInByAccountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
}
