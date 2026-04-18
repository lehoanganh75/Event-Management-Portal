package src.main.luckydrawservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class DrawEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userProfileId;

    @Enumerated(EnumType.STRING)
    private EntryStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    @JsonIgnore
    private LuckyDraw luckyDraw;
}
