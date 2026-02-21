package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "draw_entries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"lucky_draw_id", "userProfileId"}))
@Getter
@Setter
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
}
