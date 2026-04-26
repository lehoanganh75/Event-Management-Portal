package com.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.eventservice.entity.enums.ParticipationStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Liên kết với đơn đăng ký (nếu có)
    private String registrationId;

    // --- Identification ---
    private String participantAccountId; // ID tài khoản nếu là người trong hệ thống

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;
    private String avatarUrl;

    private String studentCode; // Mã số sinh viên (Dành riêng cho IUH)

    // Mã tra cứu nhanh hoặc nội dung mã QR
    @Column(unique = true)
    private String participantCode;

    // --- Professional Info (Dành cho khách mời/diễn giả) ---
    private String title;      // VD: TS, ThS, Ông, Bà
    private String position;   // Chức vụ
    private String department; // Khoa/Phòng ban
    private String organization; // Công ty/Tổ chức bên ngoài

    // --- Status & Attendance ---
    @Enumerated(EnumType.STRING)
    private ParticipationStatus status; // INVITED, CONFIRMED, ATTENDED, ABSENT

    private boolean checkedIn = false;
    private LocalDateTime attendedAt; // Thời điểm quét mã vào cổng
    private String checkedInByAccountId; // ID của Staff thực hiện check-in

    // --- Metadata ---
    @Column(columnDefinition = "TEXT")
    private String notes;

    private boolean isDeleted = false; // Cờ đánh dấu đã xóa (soft delete)

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}