package com.eventservice.entity.report;

import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.eventservice.entity.enums.RecapStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recap {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- Identification ---
    private String authorAccountId; // Người viết bài tổng kết

    // --- Content ---
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> imageUrls; // Album ảnh sự kiện (Google Drive hoặc S3 link)

    private String videoHighlightUrl; // Link YouTube/Vimeo của video recap

    // --- Classification & Metrics ---
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecapStatus status = RecapStatus.DRAFT;

    private int viewCount = 0;
    private int likeCount = 0;

    // --- Timestamps ---
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted = false;

    // --- Relationships ---
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}
