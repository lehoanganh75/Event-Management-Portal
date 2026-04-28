package com.eventservice.entity;

import com.eventservice.dto.EventCurrentUserRole;
import com.eventservice.dto.UserDto;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.EventType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String slug;

    // --- BASIC INFORMATION ---
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_topic", length = 1000)
    private String eventTopic;

    private String coverImage;

    private String location;

    private String eventMode;

    // --- TIMING ---
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationDeadline;

    // --- OWNERSHIP ---
    private String createdByAccountId;

    private String approvedByAccountId;

    // ✅ FIX LOOP JSON
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnoreProperties({"events"}) // 🔥 tránh vòng lặp
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @JsonIgnoreProperties({"organization"})
    private EventTemplate template;

    // --- STATUS ---
    private int maxParticipants;

    @Enumerated(EnumType.STRING)
    private EventType type;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;

    @Builder.Default
    private boolean isDeleted = false;

    // --- EXTRA ---
    @Builder.Default
    private boolean hasLuckyDraw = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String additionalInfo;

    @Builder.Default
    private boolean checkInEnabled = false;

    @Builder.Default
    private String qrType = "DYNAMIC"; // "DYNAMIC" or "STATIC"

    // --- AUDIT ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- JSON DATA ---
    @Column(columnDefinition = "TEXT")
    private String customFieldsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<Map<String, Object>> targetObjects;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<Map<String, Object>> recipients;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<Map<String, Object>> interactions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> interactionSettings;

    // --- TRANSIENT ---
    @Transient
    @JsonProperty("registeredCount")
    private int registeredCount;

    @Transient
    @JsonProperty("creator")
    private UserDto creator;

    @Transient
    @JsonProperty("approver")
    private UserDto approver;

    @Transient
    @JsonProperty("currentUserRole")
    private EventCurrentUserRole currentUserRole;

    // --- RELATIONSHIPS ---

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private Set<EventRegistration> registrations = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("is_deleted = false")
    @JsonIgnoreProperties("event")
    @Builder.Default
    private Set<EventOrganizer> organizers = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("is_deleted = false")
    @JsonIgnoreProperties("event")
    @Builder.Default
    private Set<EventPresenter> presenters = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("is_deleted = false")
    @JsonIgnore
    @Builder.Default
    private Set<EventParticipant> participants = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("event")
    @Builder.Default
    private Set<EventSession> sessions = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private Set<EventPost> posts = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private Set<EventFeedback> feedbacks = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("event")
    @Builder.Default
    private Set<EventInvitation> invitations = new HashSet<>();

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Recap recap;
}