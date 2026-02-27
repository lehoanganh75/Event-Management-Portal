package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lucky_draws")
@Getter
@Setter
public class LuckyDraw {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String eventId;
    private String createdByAccountId;

    @Column(nullable = false)
    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private DrawStatus status;

    private boolean allowMultipleWins;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // 1 LuckyDraw có nhiều Prize
    @OneToMany(mappedBy = "luckyDraw",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Prize> prizes;

    // 1 LuckyDraw có nhiều Entry
    @OneToMany(mappedBy = "luckyDraw",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<DrawEntry> entries;

    // 1 LuckyDraw có nhiều Result
    @OneToMany(mappedBy = "luckyDraw",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<DrawResult> results;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isDeleted;
}
