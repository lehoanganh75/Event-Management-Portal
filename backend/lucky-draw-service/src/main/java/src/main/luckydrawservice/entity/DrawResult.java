package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "draw_results")
@Getter
@Setter
public class DrawResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    private LuckyDraw luckyDraw;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prize_id", nullable = false)
    private Prize prize;

    // user-service -> chỉ lưu ID
    @Column(nullable = false)
    private String winnerProfileId;

    private LocalDateTime drawTime;

    private boolean claimed;
}