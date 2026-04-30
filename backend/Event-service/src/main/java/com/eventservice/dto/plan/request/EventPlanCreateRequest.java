package com.eventservice.dto.plan.request;

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

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import com.eventservice.entity.enums.OrganizerRole;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class EventPlanCreateRequest {
    private String organizationId;
    private String title;
    private String description;
    private String coverImage;
    private String eventTopic;
    private String location;
    private String eventMode;
    private String type;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    private int maxParticipants;
    private boolean finalized;
    private boolean archived;
    private String faculty;
    private String major;
    private List<Map<String, Object>> recipients;
    private List<Map<String, Object>> customRecipients;
    private String notes;
    private String templateId;
    private List<Map<String, Object>> programItems;
    private String customFieldsJson;
    private String createdByAccountId;

    @JsonProperty("presenters")
    private List<PresenterDto> presenters;

    @JsonProperty("organizers")
    private List<OrganizerDto> organizers;

    @JsonProperty("participants")
    private List<ParticipantDto> participants;

    @JsonProperty("targetObjects")
    private List<Map<String, Object>> targetObjects;

    @Data
    public static class PresenterDto {
        private String accountId;
        private String fullName;
        private String email;
        private String title;
        private String position;
        private String department;
        private String session;
    }

    @Data
    public static class OrganizerDto {
        private String accountId;
        private String fullName;
        private String email;
        private String title;
        private String position;
        private String department;
        private String role;
    }

    @Data
    public static class ParticipantDto {
        private String accountId;
        private String fullName;
        private String email;
        private String title;
        private String position;
        private String department;
        private String organization;
        private String code;
        private String notes;
    }
}

