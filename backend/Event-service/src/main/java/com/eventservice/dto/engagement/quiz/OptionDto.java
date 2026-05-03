package com.eventservice.dto.engagement.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionDto {
    private String id;
    private String content;
    private boolean isCorrect;
    private String matchingKey;

    public static OptionDto from(com.eventservice.entity.engagement.quiz.QuizOption o) {
        if (o == null)
            return null;
        return OptionDto.builder()
                .id(o.getId())
                .content(o.getContent())
                .isCorrect(o.isCorrect())
                .matchingKey(o.getMatchingKey())
                .build();
    }
}
