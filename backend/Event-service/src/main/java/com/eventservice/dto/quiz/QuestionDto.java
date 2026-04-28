package com.eventservice.dto.quiz;

import com.eventservice.entity.quiz.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private String id;
    private String content;
    private QuestionType type;
    private int orderIndex;
    private int timeLimit;
    private int basePoints;
    private String hint;
    private List<OptionDto> options;
    private String correctData; // Only returned to organizer or verified on backend
}

