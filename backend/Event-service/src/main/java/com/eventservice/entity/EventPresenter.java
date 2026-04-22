package com.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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

    private String phone;

    private String avatarUrl; // Ảnh đại diện của diễn giả

    // --- Professional Info ---
    private String position;   // Chức vụ (Vd: Giám đốc kỹ thuật, PGS.TS)
    private String department; // Đơn vị công tác (Vd: Khoa CNTT, Google Việt Nam)

    @Column(columnDefinition = "TEXT")
    private String bio;        // Tiểu sử tóm tắt

    private String linkedInUrl;

    // --- Event Context ---
    private String session;    // Tên phiên/chủ đề bài nói (Vd: "Ứng dụng AI trong y tế")

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

    public EventPresenter copy() {
        return EventPresenter.builder()
                .presenterAccountId(this.presenterAccountId)
                .fullName(this.fullName)
                .email(this.email)
                .phone(this.phone)
                .avatarUrl(this.avatarUrl)
                .position(this.position)
                .department(this.department)
                .bio(this.bio)
                .linkedInUrl(this.linkedInUrl)
                .session(this.session)
                .isDeleted(this.isDeleted)
                .build();
    }
}