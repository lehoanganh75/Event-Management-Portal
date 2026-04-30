package src.main.luckydrawservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prizes")
public class Prize {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;
    private int quantity;
    private int remainingQuantity;
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lucky_draw_id", nullable = false)
    @JsonIgnore
    private LuckyDraw luckyDraw;

    public Prize() {
    }

    public Prize(String id, String name, int quantity, int remainingQuantity, String description,
            LocalDateTime createdAt, LocalDateTime updatedAt, boolean isDeleted, LuckyDraw luckyDraw) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.remainingQuantity = remainingQuantity;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
        this.luckyDraw = luckyDraw;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(int remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public LuckyDraw getLuckyDraw() {
        return luckyDraw;
    }

    public void setLuckyDraw(LuckyDraw luckyDraw) {
        this.luckyDraw = luckyDraw;
    }

    public static PrizeBuilder builder() {
        return new PrizeBuilder();
    }

    public static class PrizeBuilder {
        private String id;
        private String name;
        private int quantity;
        private int remainingQuantity;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean isDeleted = false;
        private LuckyDraw luckyDraw;

        PrizeBuilder() {
        }

        public PrizeBuilder id(String id) {
            this.id = id;
            return this;
        }

        public PrizeBuilder name(String name) {
            this.name = name;
            return this;
        }

        public PrizeBuilder quantity(int quantity) {
            this.quantity = quantity;
            return this;
        }

        public PrizeBuilder remainingQuantity(int remainingQuantity) {
            this.remainingQuantity = remainingQuantity;
            return this;
        }

        public PrizeBuilder description(String description) {
            this.description = description;
            return this;
        }

        public PrizeBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PrizeBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public PrizeBuilder isDeleted(boolean isDeleted) {
            this.isDeleted = isDeleted;
            return this;
        }

        public PrizeBuilder luckyDraw(LuckyDraw luckyDraw) {
            this.luckyDraw = luckyDraw;
            return this;
        }

        public Prize build() {
            return new Prize(id, name, quantity, remainingQuantity, description, createdAt, updatedAt, isDeleted,
                    luckyDraw);
        }
    }
}
