package com.eventservice.dto.core.response;

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

