package com.eventservice.entity.template;

import com.eventservice.entity.core.*;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.eventservice.entity.enums.EventType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "event_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- Template Metadata ---
    @Column(nullable = false)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private EventType templateType;

    private String customTemplateType; // Dùng khi templateType là 'OTHER'

    // --- Default Event Data (Giá trị gợi ý khi tạo Event) ---
    private String defaultTitle;
    private String defaultCoverImage;
    private String defaultLocation;
    private String defaultEventTopic;
    private String defaultEventMode;
    private int defaultMaxParticipants;

    @Builder.Default
    private String defaultQrType = "DYNAMIC";

    @Builder.Default
    private boolean defaultCheckInEnabled = false;

    @Builder.Default
    private boolean defaultHasLuckyDraw = false;

    // --- Configuration & Flexibility ---
    @Builder.Default
    private int usageCount = 0;

    // Lưu cấu hình Form đăng ký mặc định hoặc các settings khác
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private Map<String, Object> configData = new java.util.HashMap<>();

    @Builder.Default
    private boolean isPublic = false; // Mẫu dùng chung hay nội bộ
    private String createdByAccountId; // Người tạo bản mẫu

    @Transient
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    @Builder.Default
    private boolean userStarred = false;

    @com.fasterxml.jackson.annotation.JsonGetter("isStarred")
    public boolean isStarred() {
        return userStarred;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("isStarred")
    public void setStarred(boolean starred) {
        this.userStarred = starred;
    }

    @ElementCollection
    @CollectionTable(name = "event_template_themes", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "theme")
    @Builder.Default
    private List<String> themes = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<Double> embedding;

    private LocalDateTime embeddingGeneratedAt;

    // --- Audit & Status ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean isDeleted = false;

    // --- Ownership ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;
}
