package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@Setter
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String organizationId;
    private String createdByAccountId;
    private String approvedByAccountId;

    private String title;
    private String description;
    private String coverImage;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String location;
    private String eventMode;

    private int maxParticipants;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private boolean hasLuckyDraw;
    private boolean finalized;
    private boolean archived;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventPost> posts;
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventFeedback> feedbacks;
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventRegistration> registrations;
    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Recap recap;
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventSession> session;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Transient
    private int registeredCount;
}

