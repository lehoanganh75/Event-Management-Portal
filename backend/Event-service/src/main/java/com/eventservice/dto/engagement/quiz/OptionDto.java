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
        if (o == null) return null;
        return OptionDto.builder()
                .id(o.getId())
                .content(o.getContent())
                .isCorrect(o.isCorrect())
                .matchingKey(o.getMatchingKey())
                .build();
    }
}
