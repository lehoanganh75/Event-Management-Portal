package src.main.luckydrawservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String description;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal winProbabilityPercent;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isDeleted;
}
