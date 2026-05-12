package com.eventservice.dto.engagement.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizEvent {
    private String eventId;
    private String type;
    private Object data;
}
