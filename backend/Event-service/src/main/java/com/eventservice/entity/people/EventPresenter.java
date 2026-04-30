package com.eventservice.entity.people;

import com.eventservice.entity.core.Event;
import com.eventservice.entity.core.EventSession;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // --- Event Context ---
    private boolean isDeleted = false; // Cờ đánh dấu đã xóa (soft delete)

    // --- Audit ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @OneToMany(mappedBy = "presenter", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIgnore
    private Set<EventSession> sessions = new HashSet<>();

    @PreRemove
    private void preRemove() {
        if (sessions != null) {
            sessions.forEach(s -> s.setPresenter(null));
        }
    }
}
