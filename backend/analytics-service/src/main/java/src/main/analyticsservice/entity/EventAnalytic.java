package src.main.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_analytics")
@Getter
@Setter
public class EventAnalytic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String eventId;

    private int totalRegistrations;
    private int totalAttendees;
    private double conversionRate;
    private double averageRating;
    private double npsScore;
    @CreationTimestamp
    private LocalDateTime lastUpdatedAt;

    public void calculateConversion() {
        if (totalRegistrations > 0) {
            this.conversionRate = ((double) totalAttendees / totalRegistrations) * 100;
        }
    }
}

