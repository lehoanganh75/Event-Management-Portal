package com.eventservice.dto.plan.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPlanSuggestionResponse {

    private String title;
    private String subject;
    private String purpose;
    private String description;
    private LocalDateTime suggestedStartTime;
    private LocalDateTime suggestedEndTime;
    private String suggestedLocation;
    private Integer estimatedParticipants;
    private List<EventProgramItemSuggestionResponse> programItems;
    private List<String> requiredResources;
    private List<String> teamRoles;
    private Double confidenceScore;
    private String reasoning; // AI's explanation for suggestions
    private Map<String, Object> additionalData;
}
