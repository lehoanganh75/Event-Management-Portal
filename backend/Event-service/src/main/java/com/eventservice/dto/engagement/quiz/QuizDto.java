package com.eventservice.dto.engagement.quiz;

import com.eventservice.dto.core.request.*;
import com.eventservice.dto.core.response.*;
import com.eventservice.dto.registration.request.*;
import com.eventservice.dto.registration.response.*;
import com.eventservice.dto.social.request.*;
import com.eventservice.dto.social.response.*;
import com.eventservice.dto.plan.request.*;
import com.eventservice.dto.plan.response.*;
import com.eventservice.dto.user.*;
import com.eventservice.dto.engagement.*;
import com.eventservice.dto.engagement.quiz.*;
import com.eventservice.dto.engagement.survey.*;

import com.eventservice.dto.engagement.survey.*;

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

    public static QuizDto from(com.eventservice.entity.engagement.quiz.Quiz quiz) {
        if (quiz == null) return null;
        return QuizDto.builder()
                .id(quiz.getId())
                .eventId(quiz.getEvent() != null ? quiz.getEvent().getId() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .isActive(quiz.isActive())
                .questions(quiz.getQuestions() != null ? quiz.getQuestions().stream()
                        .map(QuestionDto::from)
                        .collect(java.util.stream.Collectors.toList()) : null)
                .build();
    }
}
