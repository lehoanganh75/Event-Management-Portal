package com.eventservice.entity;

import com.eventservice.entity.enums.OrganizerRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Unified entity for all users (Organizers, Staff, Participants) in an event.
 * Each user has exactly one role per event.
 */
@Entity
@Table(name = "event_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String accountId;      // ID from Identity Service

    @Column(nullable = false)
    private String fullName;
    
    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizerRole role;    // ORGANIZER, LEADER, COORDINATOR, MEMBER, ADVISOR, PARTICIPANT

    private boolean isCheckedIn = false;
    private LocalDateTime checkedInAt;
    
    private boolean isDeleted = false;

    @CreationTimestamp
    private LocalDateTime joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}
