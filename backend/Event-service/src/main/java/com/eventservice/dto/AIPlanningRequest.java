package com.eventservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIPlanningRequest {
    private String templateId;
    private String userContext; // Additional requirements from user
    private String rawText;     // For free-text planning
}
