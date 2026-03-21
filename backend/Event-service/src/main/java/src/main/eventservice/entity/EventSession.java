package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.SessionType;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_sessions")
@Getter
@Setter
public class EventSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String room;
    @Enumerated(EnumType.STRING)
    private SessionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}