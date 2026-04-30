package com.eventservice.entity.social;

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
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.entity.enums.PostType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "event_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String slug; // URL thân thiện cho bài viết

    // --- Author ---
    @Column(nullable = false)
    private String authorAccountId; // Đổi từ createdByAccountId cho rõ nghĩa

    // --- Content ---
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    // --- Classification ---
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PostType postType; // ANNOUNCEMENT, NEWS, RECAP, GUIDELINE

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PostStatus status = PostStatus.DRAFT; // DRAFT, PUBLISHED

    // --- Settings & Metrics ---
    private boolean isPinned = false; // Ghim bài viết
    private boolean allowComments = true;
    private int viewCount = 0;

    // --- Timestamps ---
    private LocalDateTime publishedAt; // Thời điểm hiển thị (có thể lên lịch trước)

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted = false;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @Builder.Default
    private List<PostComment> comments = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> imageUrls; // Danh sách ảnh trong bài viết

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, String> reactions = new HashMap<>(); // accountId -> emoji

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}
