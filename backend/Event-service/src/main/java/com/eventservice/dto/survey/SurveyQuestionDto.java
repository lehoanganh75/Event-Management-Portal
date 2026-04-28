package com.eventservice.dto.survey;

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
}
