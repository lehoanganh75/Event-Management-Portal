package com.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.eventservice.entity.enums.InvitationStatus;
import com.eventservice.entity.enums.OrganizerRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_invitations") // SỬA: Phải là event_invitations, không phải feedbacks
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- Actor Information ---
    @Column(nullable = false)
    private String inviterAccountId; // ID người gửi (Trưởng ban/Người tạo event)

    @Column(nullable = false)
    private String inviteeEmail;     // Email người được mời (Dùng email để mời cả người chưa có acc)

    // ID này sẽ được cập nhật sau khi người dùng nhấn "Accept" và hệ thống khớp email
    private String inviteeAccountId;

    private String inviteeName;

    private String inviteePosition; // Vị trí công tác của người được mời (Vd: "Sinh viên năm 3 - Khoa CNTT")

    @Enumerated(EnumType.STRING)
    private OrganizerRole targetRole; // Vai trò dự kiến: LEADER, MEMBER, LOGISTICS...

    // --- Content & Roles ---
    @Column(columnDefinition = "TEXT")
    private String message;          // Lời nhắn gửi kèm (Vd: "Mời bạn làm truyền thông")

    // --- Status & Tracking ---
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING;

    private String rejectionReason;  // Lý do từ chối (Nếu họ chọn REJECTED)

    private String token;

    // --- Timestamps ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime sentAt;

    private LocalDateTime respondedAt; // Thời điểm phản hồi

    private LocalDateTime expiredAt;   // (Nên có) Thời hạn lời mời (vd: sau 7 ngày sẽ hết hạn)

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
}