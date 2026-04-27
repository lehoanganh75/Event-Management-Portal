package src.main.analyticsservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_analytics")
public class EventAnalytic {
    @Id
    private String eventId;

    private int totalRegistrations;
    private int totalAttendees;
    private int totalLikes;
    private int totalShares;
    private int totalComments;
    private String topHashtags;
    private double conversionRate;
    private double averageRating;
    private double npsScore;
    private LocalDateTime lastUpdatedAt;

    public EventAnalytic() {}

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = LocalDateTime.now();
    }

    public void calculateConversion() {
        if (totalRegistrations > 0) {
            this.conversionRate = ((double) totalAttendees / totalRegistrations) * 100;
        }
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public int getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(int totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public int getTotalAttendees() {
        return totalAttendees;
    }

    public void setTotalAttendees(int totalAttendees) {
        this.totalAttendees = totalAttendees;
    }

    public int getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(int totalLikes) {
        this.totalLikes = totalLikes;
    }

    public int getTotalShares() {
        return totalShares;
    }

    public void setTotalShares(int totalShares) {
        this.totalShares = totalShares;
    }

    public int getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(int totalComments) {
        this.totalComments = totalComments;
    }

    public String getTopHashtags() {
        return topHashtags;
    }

    public void setTopHashtags(String topHashtags) {
        this.topHashtags = topHashtags;
    }

    public double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(double conversionRate) {
        this.conversionRate = conversionRate;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public double getNpsScore() {
        return npsScore;
    }

    public void setNpsScore(double npsScore) {
        this.npsScore = npsScore;
    }

    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
}
