package com.eventservice.dto.plan.response;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventProgramItemSuggestionResponse {

    private String title;
    private String description;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String speaker;
    private String location;
    private String notes;
}
