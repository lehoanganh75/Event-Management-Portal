package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.CheckInMethod;

import java.time.LocalDateTime;

@Entity
@Table(name = "checkins")
@Getter
@Setter
public class CheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private EventRegistration registration;

    private LocalDateTime checkInTime;

    @Enumerated(EnumType.STRING)
    private CheckInMethod method;
}