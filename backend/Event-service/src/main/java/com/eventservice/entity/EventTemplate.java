package com.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private String defaultEventMode;
    private int defaultMaxParticipants;

    // --- IUH Specific Category ---
    private String faculty;
    private String major;

    // --- Configuration & Flexibility ---
    @Builder.Default
    private int usageCount = 0;

    // Lưu cấu hình Form đăng ký mặc định hoặc các settings khác
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> configData;

    private boolean isPublic = false; // Mẫu dùng chung hay nội bộ

    @ElementCollection
    @CollectionTable(
            name = "event_template_themes",
            joinColumns = @JoinColumn(name = "template_id")
    )
    @Column(name = "theme")
    @Builder.Default
    private List<String> themes = new ArrayList<>();

    // --- Audit & Status ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted = false;

    // --- Ownership ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private Organization organization;
}