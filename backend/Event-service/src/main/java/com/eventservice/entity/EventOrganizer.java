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
    private String avatarUrl;      // Ảnh đại diện
    private String phone;          // Số điện thoại liên hệ

    @Enumerated(EnumType.STRING)
    private OrganizerRole role;    // LEADER, COORDINATOR, MEMBER, ADVISOR

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private com.eventservice.entity.enums.OrganizerStatus status = com.eventservice.entity.enums.OrganizerStatus.ACTIVE;

    private boolean isDeleted = false; // Cờ đánh dấu đã xóa (soft delete)

    private String addedByAccountId; // ID của người đã mời/thêm người này (Dùng cho phân quyền hiển thị)

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
                .role(this.role)
                .isDeleted(this.isDeleted)
                .organization(this.organization)
                .build();
    }
}