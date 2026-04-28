package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "draw_results")
public class DrawResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String winnerProfileId;

    private LocalDateTime drawTime;

    private boolean claimed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    private LuckyDraw luckyDraw;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prize_id", nullable = false)
    private Prize prize;

    public DrawResult() {}

    public DrawResult(String id, String winnerProfileId, LocalDateTime drawTime, boolean claimed, LuckyDraw luckyDraw, Prize prize) {
        this.id = id;
        this.winnerProfileId = winnerProfileId;
        this.drawTime = drawTime;
        this.claimed = claimed;
        this.luckyDraw = luckyDraw;
        this.prize = prize;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWinnerProfileId() {
        return winnerProfileId;
    }

    public void setWinnerProfileId(String winnerProfileId) {
        this.winnerProfileId = winnerProfileId;
    }

    public LocalDateTime getDrawTime() {
        return drawTime;
    }

    public void setDrawTime(LocalDateTime drawTime) {
        this.drawTime = drawTime;
    }

    public boolean isClaimed() {
        return claimed;
    }

    public void setClaimed(boolean claimed) {
        this.claimed = claimed;
    }

    public LuckyDraw getLuckyDraw() {
        return luckyDraw;
    }

    public void setLuckyDraw(LuckyDraw luckyDraw) {
        this.luckyDraw = luckyDraw;
    }

    public Prize getPrize() {
        return prize;
    }

    public void setPrize(Prize prize) {
        this.prize = prize;
    }
}