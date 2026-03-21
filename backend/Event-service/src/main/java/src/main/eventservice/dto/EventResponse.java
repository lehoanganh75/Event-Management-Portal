package src.main.eventservice.dto;

import lombok.*;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.entity.enums.EventType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private String id;
    private String organizationId;
    private String createdByAccountId;
    private String approvedByAccountId;
    private String title;
    private String description;
    private String eventTopic;
    private String coverImage;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;

    private String location;
    private String eventMode;
    private int maxParticipants;
    private int registeredCount;

    private EventType type;
    private EventStatus status;

    private String luckyDrawId;

    private String faculty;
    private String major;
    private String organizerUnit;

    private boolean finalized;
    private boolean archived;
    private boolean isDeleted;

    private String notes;
    private String additionalInfo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}