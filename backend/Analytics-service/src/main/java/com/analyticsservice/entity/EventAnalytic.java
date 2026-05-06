package com.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAnalytic {

    @Id
    private String eventId;

    private int totalLikes;
    private int totalComments;
    private int totalRegistrations;
    private int totalAttendees;

    private double averageRating;

    @Builder.Default
    private double conversionRate = 0.0;

    public void calculateConversion() {
        if (totalRegistrations > 0) {
            this.conversionRate = (double) totalAttendees / totalRegistrations * 100;
        }
    }
}
