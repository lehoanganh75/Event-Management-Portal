package com.eventservice.dto.engagement.quiz;

import com.eventservice.entity.engagement.quiz.QuestionType;
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

    public static QuestionDto from(com.eventservice.entity.engagement.quiz.QuizQuestion q) {
        if (q == null)
            return null;
        return QuestionDto.builder()
                .id(q.getId())
                .content(q.getContent())
                .type(q.getType())
                .orderIndex(q.getOrderIndex())
                .timeLimit(q.getTimeLimit())
                .basePoints(q.getBasePoints())
                .hint(q.getHint())
                .correctData(q.getCorrectData())
                .options(q.getOptions() != null ? q.getOptions().stream()
                        .map(OptionDto::from)
                        .collect(java.util.stream.Collectors.toList()) : null)
                .build();
    }
}
