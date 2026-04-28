package com.eventservice.dto;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramItemSuggestion {
    
    private String title;
    private String description;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String speaker;
    private String location;
    private String notes;
}
