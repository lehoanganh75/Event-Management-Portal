package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_comments")
@Getter
@Setter
public class PostComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private EventPost post;

    private String userProfileId;

    @Column(length = 200)
    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
