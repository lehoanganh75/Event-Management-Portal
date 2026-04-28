package com.eventservice.entity.survey;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "survey_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String surveyId;
    
    private String participantAccountId;
    
    @Column(columnDefinition = "TEXT")
    private String answers; // JSON blob of questionId -> answer

    @CreationTimestamp
    private LocalDateTime submittedAt;
}
