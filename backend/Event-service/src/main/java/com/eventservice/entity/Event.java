package com.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.eventservice.dto.UserDto;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.EventType;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // Thêm Builder để dễ tạo object trong Service/Test
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String slug; // Dùng cho URL đẹp (vd: /event/iuh-tech-day)

    // --- BASIC INFORMATION ---
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_topic", length = 1000)
    private String eventTopic;

    private String coverImage;

    private String location;

    private String eventMode; // ONLINE, OFFLINE, HYBRID

    // --- TIMING & DEADLINES ---
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationDeadline;

    // --- OWNERSHIP & APPROVAL ---
    // Đã xóa phần trùng lặp ở đây
    private String createdByAccountId;

    private String approvedByAccountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @JsonIgnore
    private EventTemplate template;

    // --- CAPACITY & STATUS ---
    private int maxParticipants;

    @Enumerated(EnumType.STRING)
    private EventType type;

    @Builder.Default // Giúp Builder không ghi đè giá trị mặc định
    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;

    @Builder.Default
    private boolean finalized = false;

    @Builder.Default
    private boolean archived = false; // Thêm @Builder.Default để Builder của Lombok nhận giá trị này

    @Builder.Default
    private boolean isDeleted = false;

    // --- ADDITIONAL TOOLS & INFO ---
    private String luckyDrawId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String additionalInfo;

    // --- AUDIT TIMESTAMPS ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- JSON DATA (FLEXIBLE) ---
    // Chứa cấu hình form đăng ký hoặc tiêu chí riêng
    @Column(columnDefinition = "TEXT")
    private String customFieldsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<Map<String, Object>> targetObjects;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<Map<String, Object>> recipients;

    // --- TRANSIENT FIELDS ---
    @Transient // Không lưu vào DB, dùng để tính toán lúc runtime
    private int registeredCount;

    // --- RELATIONSHIPS ---
    // Khởi tạo sẵn ArrayList để tránh NullPointer
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonIgnore
    private Set<EventRegistration> registrations = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("is_deleted = false")
//    @JsonIgnore
    private Set<EventOrganizer> organizers = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("is_deleted = false")
//    @JsonIgnore
    private Set<EventPresenter> presenters = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("is_deleted = false")
    @JsonIgnore
    private Set<EventParticipant> participants = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<EventSession> sessions = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<EventPost> posts = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<EventFeedback> feedbacks = new HashSet<>();

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Recap recap;

    @Transient
    private UserDto creator;

    @Transient
    private UserDto approver;
}