package com.eventservice.entity;

import com.eventservice.dto.UserDto;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

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
public class PostComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- Author ---
    @Column(nullable = false)
    private String commenterAccountId; // ID người bình luận

    @Transient
    private UserDto author;

    // --- Content ---
    @Column(nullable = false, length = 1000) // Tăng độ dài cho thảo luận thoải mái
    private String content;

    // --- Status ---
    private boolean isEdited = false;

    private boolean isDeleted = false;

    // --- Audit ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, String> reactions = new HashMap<>(); // accountId -> emoji

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