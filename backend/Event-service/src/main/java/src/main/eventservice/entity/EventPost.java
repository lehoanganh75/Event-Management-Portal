package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.entity.enums.PostType;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "event_posts")
@Getter
@Setter
@ToString
public class EventPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostComment> comments;

    private String createdByAccountId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private PostType postType;

    @Enumerated(EnumType.STRING)
    private PostStatus status;

    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted;
}