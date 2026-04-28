package com.eventservice.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionDto {
    private String quizId;
    private String questionId;
    private String answer; // Could be optionId, or JSON for matching/scramble
    private double responseTime; // Seconds
}
