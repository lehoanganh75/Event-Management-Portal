package com.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.eventservice.entity.enums.OrganizerRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_organizers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventOrganizer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String accountId;      // ID người dùng (từ Identity Service)

    private String fullName;       // Tên hiển thị trong ban tổ chức
    private String email;          // Email liên hệ
    private String position;       // Chức vụ trong sự kiện (vd: Trưởng ban)

    @Enumerated(EnumType.STRING)
    private OrganizerRole role;    // LEADER, COORDINATOR, MEMBER, ADVISOR

    private boolean isDeleted = false; // Cờ đánh dấu đã xóa (soft delete)

    @CreationTimestamp
    private LocalDateTime assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private Organization organization; // Đơn vị mà nhân sự này thuộc về (Vd: CLB HIT)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    public EventOrganizer copy() {
        return EventOrganizer.builder()
                .accountId(this.accountId)
                .fullName(this.fullName)
                .email(this.email)
                .position(this.position)
                .role(this.role)
                .isDeleted(this.isDeleted)
                .organization(this.organization)
                .build();
    }
}