package com.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_summary_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSummaryReport {

    @Id
    private String eventId;

    @Column(columnDefinition = "TEXT")
    private String quantitativeAnalysis;

    @Column(columnDefinition = "TEXT")
    private String qualitativeAnalysis;

    @Column(columnDefinition = "TEXT")
    private String summaryReport;

    @Column(columnDefinition = "TEXT")
    private String improvementProposals;

    @Builder.Default
    private boolean aiProcessed = false;

    @Column(columnDefinition = "TEXT")
    private String aiErrorLog;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
