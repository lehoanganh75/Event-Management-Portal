package com.eventservice.entity.quiz;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_participations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String quizId;
    
    private String participantAccountId;
    
    private String fullName;
    
    private String avatarUrl;

    @Builder.Default
    private int totalScore = 0;

    @UpdateTimestamp
    private LocalDateTime lastUpdatedAt;
}
