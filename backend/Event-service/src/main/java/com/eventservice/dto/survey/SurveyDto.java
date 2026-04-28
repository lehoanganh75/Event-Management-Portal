package com.eventservice.dto.survey;

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
}

