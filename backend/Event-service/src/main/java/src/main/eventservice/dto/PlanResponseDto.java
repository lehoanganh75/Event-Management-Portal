package src.main.eventservice.dto;

import lombok.Data;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventOrganizer;
import src.main.eventservice.entity.EventParticipant;
import src.main.eventservice.entity.EventPresenter;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
public class PlanResponseDto {
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

    private List<Map<String, Object>> targetObjects;
    private List<EventPresenter> presentersList;
    private List<EventOrganizer> organizersList;
    private List<EventParticipant> participantsList;



    public static PlanResponseDto from(Event event, UserDto creator, UserDto approver) {
        PlanResponseDto dto = new PlanResponseDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setStatus(event.getStatus() != null ? event.getStatus().name() : null);
        dto.setStartTime(event.getStartTime() != null ? event.getStartTime().toString() : null);
        dto.setEndTime(event.getEndTime() != null ? event.getEndTime().toString() : null);
        dto.setRegistrationDeadline(event.getRegistrationDeadline() != null ? event.getRegistrationDeadline().toString() : null);
        dto.setLocation(event.getLocation());
        dto.setFaculty(event.getFaculty());
        dto.setMajor(event.getMajor());
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

        if (event.getRecipients() != null) {
            List<String> recipientNames = event.getRecipients().stream()
                    .map(r -> (String) r.get("name"))
                    .filter(name -> name != null)
                    .collect(Collectors.toList());
            dto.setRecipients(recipientNames);
        }


        dto.setTargetObjects(event.getTargetObjects());
        dto.setPresentersList(event.getPresenters());
        dto.setOrganizersList(event.getOrganizers());
        dto.setParticipantsList(event.getParticipants());

        if (approver != null) {
            dto.setApprovedByName(approver.getFullName());
        }
        if (creator != null) {
            dto.setCreatedByName(creator.getFullName());
            dto.setCreatedByAvatar(creator.getAvatarUrl());
        }
        return dto;
    }
}