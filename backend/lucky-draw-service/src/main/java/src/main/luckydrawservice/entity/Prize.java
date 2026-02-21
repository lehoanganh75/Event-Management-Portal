package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prizes")
@Getter
@Setter
public class Prize {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    private LuckyDraw luckyDraw;

    @Column(nullable = false)
    private String name;

    private int quantity;

    private int remainingQuantity;
}
