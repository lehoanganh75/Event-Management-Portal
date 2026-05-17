package com.eventservice.dto.plan.response;

import com.eventservice.dto.user.*;

import lombok.Data;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.people.EventOrganizer;
import com.eventservice.entity.people.EventPresenter;
import com.eventservice.entity.core.EventSession;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Data
public class EventPlanResponse {
    private String id;
    private String title;
    private String description;
    private String status;
    private String startTime;
    private String endTime;
    private String registrationDeadline;
    private String location;
    private String faculty;
    private String major;
    private String type;
    private String eventMode;
    private Integer maxParticipants;
    private List<String> participants;
    private List<String> recipients;
    private List<String> customRecipients;
    private List<String> presenters;
    private List<String> organizingCommittee;
    private String createdAt;
    private String updatedAt;

    private String eventTopic;
    private String coverImage;
    private String notes;
    private String additionalInfo;
    private String customFieldsJson;
    private List<String> attendees;
    private boolean hasLuckyDraw;

    private String createdByAccountId;
    private String createdByName;
    private String createdByAvatar;
    private String approvedByName;
    private String approvedByAccountId;

    private String organizationId;
    private String organizationName;
    private String organizationEmail;
    private String organizationLogo;

    private List<Map<String, Object>> targetObjects;
    private List<EventPresenter> presentersList;
    private List<EventOrganizer> organizersList;
    private List<EventSession> sessionsList;

    public static EventPlanResponse from(Event event, UserResponse creator, UserResponse approver,
            List<EventPresenter> presenters,
            List<EventOrganizer> organizers,
            List<EventSession> sessions) {
        EventPlanResponse dto = new EventPlanResponse();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setStatus(event.getStatus() != null ? event.getStatus().name() : null);
        dto.setStartTime(event.getStartTime() != null ? event.getStartTime().toString() : null);
        dto.setEndTime(event.getEndTime() != null ? event.getEndTime().toString() : null);
        dto.setRegistrationDeadline(
                event.getRegistrationDeadline() != null ? event.getRegistrationDeadline().toString() : null);
        dto.setLocation(event.getLocation());
        dto.setType(event.getType() != null ? event.getType().name() : null);
        dto.setEventMode(event.getEventMode());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setEventTopic(event.getEventTopic());
        dto.setCoverImage(event.getCoverImage());
        dto.setNotes(event.getNotes());
        dto.setAdditionalInfo(event.getAdditionalInfo());
        dto.setCustomFieldsJson(event.getCustomFieldsJson());
        dto.setCreatedAt(event.getCreatedAt() != null ? event.getCreatedAt().toString() : null);
        dto.setUpdatedAt(event.getUpdatedAt() != null ? event.getUpdatedAt().toString() : null);
        dto.setApprovedByAccountId(event.getApprovedByAccountId());
        dto.setCreatedByAccountId(event.getCreatedByAccountId());

        if (event.getOrganization() != null) {
            dto.setOrganizationId(event.getOrganization().getId());
            dto.setOrganizationName(event.getOrganization().getName());
            dto.setOrganizationEmail(event.getOrganization().getEmail());
            dto.setOrganizationLogo(event.getOrganization().getLogoUrl());
        }

        if (event.getRecipients() != null) {
            List<String> recipientNames = event.getRecipients().stream()
                    .filter(Objects::nonNull)
                    .map(r -> {
                        Object name = r.get("name");
                        return name != null ? name.toString() : null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            dto.setRecipients(recipientNames);
        }

        dto.setTargetObjects(event.getTargetObjects());

        // Use provided lists instead of entity collections
        dto.setPresentersList(presenters != null ? new ArrayList<>(presenters) : new ArrayList<>());
        dto.setOrganizersList(organizers != null ? new ArrayList<>(organizers) : new ArrayList<>());
        dto.setSessionsList(sessions != null ? new ArrayList<>(sessions) : new ArrayList<>());

        if (approver != null) {
            dto.setApprovedByName(approver.getFullName());
        }
        if (creator != null) {
            dto.setCreatedByName(creator.getFullName());
            dto.setCreatedByAvatar(creator.getAvatarUrl());
        }
        return dto;
    }

    public static EventPlanResponse from(Event event, UserResponse creator, UserResponse approver,
            List<EventPresenter> presenters,
            List<EventOrganizer> organizers) {
        return from(event, creator, approver, presenters, organizers,
                event.getSessions() != null ? new ArrayList<>(event.getSessions()) : null);
    }

    // Keep the old signature for backward compatibility if needed, calling the new
    // one
    public static EventPlanResponse from(Event event, UserResponse creator, UserResponse approver) {
        return from(event, creator, approver,
                event.getPresenters() != null ? new ArrayList<>(event.getPresenters()) : null,
                event.getOrganizers() != null ? new ArrayList<>(event.getOrganizers()) : null,
                event.getSessions() != null ? new ArrayList<>(event.getSessions()) : null);
    }
}
