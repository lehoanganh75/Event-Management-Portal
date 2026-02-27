package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "draw_entries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"lucky_draw_id", "userProfileId"}))
@Getter
@Setter
// Đại diện cho một lượt tham gia của người dùng vào một chương trình quay
public class DrawEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    private LuckyDraw luckyDraw;

    // user-service -> chỉ lưu ID
    @Column(nullable = false)
    private String userProfileId;

    @Enumerated(EnumType.STRING)
    private EntryStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
