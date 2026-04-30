package com.eventservice.entity.engagement.quiz;

import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

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
    
    @Transient
    private String fullName;
    
    @Transient
    private String avatarUrl;

    @Builder.Default
    private int totalScore = 0;

    @UpdateTimestamp
    private LocalDateTime lastUpdatedAt;
}
