package com.eventservice.entity.core;

import com.eventservice.entity.people.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.eventservice.entity.enums.SessionType;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- Basic Information ---
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String room; // Phòng học/Hội trường (Vd: H3.1, E4)

    @Enumerated(EnumType.STRING)
    private SessionType type; // KEYNOTE, WORKSHOP, BREAK, DISCUSSION

    // --- Timing ---
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private int orderIndex; // Thứ tự sắp xếp (1, 2, 3...)

    private boolean isDeleted = false;

    // --- Audit ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "presenter_id")
    @JsonIgnoreProperties({ "event", "sessions" })
    private EventPresenter presenter;
}
