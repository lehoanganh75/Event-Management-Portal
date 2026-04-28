package com.eventservice.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDto {
    private String id;
    private String eventId;
    private String title;
    private String description;
    private List<QuestionDto> questions;
    private boolean isActive;
}
