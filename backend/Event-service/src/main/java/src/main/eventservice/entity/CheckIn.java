package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.CheckInMethod;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_ins")
@Getter
@Setter
public class CheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private LocalDateTime checkInTime;

    @Enumerated(EnumType.STRING)
    private CheckInMethod method;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    @JsonIgnore
    private EventRegistration registration;
}