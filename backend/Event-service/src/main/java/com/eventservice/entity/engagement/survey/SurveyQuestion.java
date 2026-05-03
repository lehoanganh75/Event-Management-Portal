package com.eventservice.entity.engagement.survey;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "survey_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id")
    @JsonIgnore
    private Survey survey;

    private String questionText;

    private String type; // RATING, TEXT, MULTIPLE_CHOICE

    @Column(columnDefinition = "TEXT")
    private String options; // For MULTIPLE_CHOICE, stored as JSON or comma-separated

    private int orderIndex;

    private boolean isRequired;
}
