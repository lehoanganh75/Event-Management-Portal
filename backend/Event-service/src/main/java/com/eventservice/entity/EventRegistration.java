package com.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.eventservice.entity.enums.RegistrationStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "event_registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- User Identification ---
    @Column(nullable = false)
    private String participantAccountId; // ID tài khoản người đăng ký

    @Transient
    private String fullName;
    @Transient
    private String avatarUrl;

    // --- Registration Details ---
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> answersJson; // Lưu câu trả lời cho customFields của Event

    // --- Ticket & Check-in ---
    private String ticketCode; // Mã vé ngắn gọn (VD: DXH-2026-001)

    @Column(name = "qr_token", length = 2048)
    private String qrToken; // Chuỗi mã hóa để tạo mã QR

    private LocalDateTime qrTokenExpiry;

    private boolean checkedIn = false;

    private LocalDateTime checkInTime;

    private String checkedInByAccountId; // ID của Staff/Admin thực hiện quét mã

    // --- Audit & Status ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime registeredAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted = false;

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}