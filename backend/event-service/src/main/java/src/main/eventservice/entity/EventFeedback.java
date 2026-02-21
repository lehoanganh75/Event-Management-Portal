package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_feedback")
@Getter
@Setter
public class EventFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userProfileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    private Integer rating;
    private Integer npsScore;

    @Column(length = 200)
    private String comment;

    private LocalDateTime createdAt;
}
