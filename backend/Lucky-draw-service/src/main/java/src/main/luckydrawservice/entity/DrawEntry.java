package src.main.luckydrawservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "draw_entries", uniqueConstraints = @UniqueConstraint(columnNames = { "lucky_draw_id", "userProfileId" }))
public class DrawEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userProfileId;

    @Enumerated(EnumType.STRING)
    private EntryStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Transient
    private src.main.luckydrawservice.dto.UserResponse profile;
    @Transient
    private src.main.luckydrawservice.dto.UserResponse winner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    @JsonIgnore
    private LuckyDraw luckyDraw;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
