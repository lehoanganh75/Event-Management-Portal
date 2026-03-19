package src.main.eventservice.dto;

import lombok.Data;
import src.main.eventservice.entity.Event;

import java.util.List;

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

    private String createdByName;
    private String createdByAvatar;
    private String approvedByName;

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
        dto.setParticipants(event.getParticipants());
        dto.setRecipients(event.getRecipients());
        dto.setCustomRecipients(event.getCustomRecipients());
        dto.setEventTopic(event.getEventTopic());
        dto.setCoverImage(event.getCoverImage());
        dto.setNotes(event.getNotes());
        dto.setAdditionalInfo(event.getAdditionalInfo());
        dto.setCustomFieldsJson(event.getCustomFieldsJson());
        dto.setAttendees(event.getAttendees());
        dto.setHasLuckyDraw(event.isHasLuckyDraw());
        dto.setPresenters(event.getPresenters());
        dto.setOrganizingCommittee(event.getOrganizingCommittee());
        dto.setCreatedAt(event.getCreatedAt() != null ? event.getCreatedAt().toString() : null);
        dto.setUpdatedAt(event.getUpdatedAt() != null ? event.getUpdatedAt().toString() : null);

        if (creator != null) {
            dto.setCreatedByName(creator.getFullName());
            dto.setCreatedByAvatar(creator.getAvatarUrl());
        }
        if (approver != null) {
            dto.setApprovedByName(approver.getFullName());
        }
        return dto;
    }
}