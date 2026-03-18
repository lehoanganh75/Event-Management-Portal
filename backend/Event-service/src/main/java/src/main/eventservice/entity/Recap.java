package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.RecapStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "recaps")
@Getter
@Setter
public class Recap {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    private String title;

    @Column(length = 200)
    private String content;

    @Enumerated(EnumType.STRING)
    private RecapStatus status;

    private int viewCount;
    private int likeCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}