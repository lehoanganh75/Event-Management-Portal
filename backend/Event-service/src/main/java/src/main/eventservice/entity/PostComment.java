package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnore
    private EventPost post;

    // Hỗ trợ cấu trúc cây (Reply bình luận)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private PostComment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL)
    private List<PostComment> replies = new ArrayList<>();
}