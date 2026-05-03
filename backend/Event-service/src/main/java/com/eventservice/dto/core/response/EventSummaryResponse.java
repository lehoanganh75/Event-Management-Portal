package com.eventservice.dto.core.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSummaryResponse {
    private String id;
    private String eventId;
    private int totalRegistered;
    private int totalCheckedIn;
    private double attendanceRate;
    private Map<String, Object> luckyDrawWinners;
    private Map<String, Object> feedbackStats;
    private Map<String, Object> detailedAnalysis;
    private LocalDateTime createdAt;
}
