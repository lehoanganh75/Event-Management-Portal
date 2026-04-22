package src.main.luckydrawservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lucky_draws")
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
    private DrawStatus status = DrawStatus.PENDING;

    private boolean allowMultipleWins;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    // 1 LuckyDraw có nhiều Prize
    @OneToMany(mappedBy = "luckyDraw",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnoreProperties("luckyDraw")
    private List<Prize> prizes;

    // 1 LuckyDraw có nhiều Entry
    @OneToMany(mappedBy = "luckyDraw",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnoreProperties("luckyDraw")
    private List<DrawEntry> entries;

    // 1 LuckyDraw có nhiều Result
    @OneToMany(mappedBy = "luckyDraw",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnoreProperties("luckyDraw")
    private List<DrawResult> results;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isDeleted = false;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getCreatedByAccountId() {
        return createdByAccountId;
    }

    public void setCreatedByAccountId(String createdByAccountId) {
        this.createdByAccountId = createdByAccountId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DrawStatus getStatus() {
        return status;
    }

    public void setStatus(DrawStatus status) {
        this.status = status;
    }

    public boolean isAllowMultipleWins() {
        return allowMultipleWins;
    }

    public void setAllowMultipleWins(boolean allowMultipleWins) {
        this.allowMultipleWins = allowMultipleWins;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public List<Prize> getPrizes() {
        return prizes;
    }

    public void setPrizes(List<Prize> prizes) {
        this.prizes = prizes;
    }

    public List<DrawEntry> getEntries() {
        return entries;
    }

    public void setEntries(List<DrawEntry> entries) {
        this.entries = entries;
    }

    public List<DrawResult> getResults() {
        return results;
    }

    public void setResults(List<DrawResult> results) {
        this.results = results;
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
}
