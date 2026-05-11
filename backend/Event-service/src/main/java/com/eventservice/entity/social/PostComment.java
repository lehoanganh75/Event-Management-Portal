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

import com.eventservice.dto.user.UserResponse;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "post_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("is_deleted = 0")
public class PostComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Transient
    private String parentId;

    // --- Author ---
    @Column(nullable = false)
    private String commenterAccountId; // ID người bình luận

    @Transient
    private UserResponse author;

    // --- Content ---
    @Column(nullable = false, length = 1000) // Tăng độ dài cho thảo luận thoải mái
    private String content;

    // --- Status ---
    private Boolean isEdited = false;

    private Boolean isDeleted = false;
    
    @JsonProperty("isAnonymous")
    @Column(name = "is_anonymous")
    private Boolean anonymous = false;

    @JsonProperty("isAnonymous")
    public Boolean isAnonymous() {
        return anonymous != null && anonymous;
    }

    public void setAnonymous(Boolean anonymous) {
        this.anonymous = anonymous;
    }

    private String anonymousIdentity;

    // --- Audit ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, String> reactions = new HashMap<>(); // accountId -> emoji

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> imageUrls = new ArrayList<>(); // accountId -> emoji

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @JsonBackReference
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private EventPost post;

    // Hỗ trợ cấu trúc cây (Reply bình luận)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference(value = "comment-replies")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PostComment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "comment-replies") // Cho phép hiển thị danh sách câu trả lời
    @Builder.Default
    private List<PostComment> replies = new ArrayList<>();
}
