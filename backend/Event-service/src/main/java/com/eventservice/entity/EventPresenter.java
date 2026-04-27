package com.eventservice.entity;

import com.eventservice.entity.enums.ParticipationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "event_presenters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPresenter {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- Identification ---
    // ID tài khoản nếu là người trong hệ thống (Giảng viên/Sinh viên IUH)
    private String presenterAccountId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String avatarUrl; // Ảnh đại diện của diễn giả

    @Column(columnDefinition = "TEXT")
    private String bio;

    // --- Status & Invitation ---
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private ParticipationStatus status = ParticipationStatus.PENDING;

    // --- Event Context ---
    private boolean isDeleted = false; // Cờ đánh dấu đã xóa (soft delete)

    // --- Audit ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;

    @Transient
    private String targetSessionName; // Dùng để nhận từ FE lúc tạo (vd: "ALL" hoặc tên session)

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @OneToMany(mappedBy = "presenter", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnoreProperties("presenter")
    private Set<EventSession> sessions = new HashSet<>();

    @PreRemove
    private void preRemove() {
        if (sessions != null) {
            sessions.forEach(s -> s.setPresenter(null));
        }
    }

    public EventPresenter copy() {
        return EventPresenter.builder()
                .presenterAccountId(this.presenterAccountId)
                .fullName(this.fullName)
                .email(this.email)
                .avatarUrl(this.avatarUrl)
                .bio(this.bio)
                .sessions(this.sessions)
                .isDeleted(this.isDeleted)
                .build();
    }
}