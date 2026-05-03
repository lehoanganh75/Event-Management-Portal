package com.eventservice.dto.engagement.survey;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyQuestionDto {
    private String id;
    private String questionText;
    private String type;
    private String options;
    private int orderIndex;
    private boolean isRequired;

    public static SurveyQuestionDto from(com.eventservice.entity.engagement.survey.SurveyQuestion q) {
        if (q == null)
            return null;
        return SurveyQuestionDto.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .type(q.getType())
                .options(q.getOptions())
                .orderIndex(q.getOrderIndex())
                .isRequired(q.isRequired())
                .build();
    }
}
