package com.eventservice.dto.engagement.survey;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDto {
    private String id;
    private String eventId;
    private String title;
    private String description;
    private List<SurveyQuestionDto> questions;
    private boolean isPublished;

    public static SurveyDto from(com.eventservice.entity.engagement.survey.Survey survey) {
        if (survey == null)
            return null;
        return SurveyDto.builder()
                .id(survey.getId())
                .eventId(survey.getEvent() != null ? survey.getEvent().getId() : null)
                .title(survey.getTitle())
                .description(survey.getDescription())
                .isPublished(survey.isPublished())
                .questions(survey.getQuestions() != null ? survey.getQuestions().stream()
                        .map(SurveyQuestionDto::from)
                        .collect(java.util.stream.Collectors.toList()) : null)
                .build();
    }
}
