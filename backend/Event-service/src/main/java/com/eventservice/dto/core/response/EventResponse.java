package com.eventservice.dto.core.response;

import com.eventservice.dto.user.*;

import lombok.*;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.EventType;
import com.eventservice.entity.core.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.eventservice.dto.people.response.*;
import com.eventservice.dto.registration.response.*;
import com.eventservice.dto.social.response.*;
import com.eventservice.dto.engagement.response.*;
import com.eventservice.dto.engagement.quiz.QuizDto;
import com.eventservice.dto.engagement.survey.SurveyDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    private String id;
    private String slug;
    private OrganizationResponse organization;

    private UserResponse creator;
    private UserResponse approver;

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

    private boolean hasLuckyDraw;

    private String organizerUnit;

    private boolean checkInEnabled;
    private String qrType;

    private boolean isDeleted;

    private String notes;
    private String additionalInfo;

    private String customFieldsJson;
    private List<Map<String, Object>> targetObjects;
    private List<Map<String, Object>> recipients;

    private EventUserRoleResponse currentUserRole;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- RELATIONSHIPS (DTOs) ---
    private List<EventRegistrationResponse> registrations;
    private List<EventOrganizerResponse> organizers;
    private List<EventPresenterResponse> presenters;
    private List<EventSessionResponse> sessions;
    private List<EventPostResponse> posts;
    private List<EventFeedbackResponse> feedbacks;
    private List<EventInvitationResponse> invitations;
    private RecapResponse recap;
    private List<QuizDto> quizzes;
    private SurveyDto survey;

    public static EventResponse from(Event event, UserResponse creator, UserResponse approver, int registeredCount,
            EventUserRoleResponse currentUserRole, Map<String, UserResponse> userMap) {
        if (event == null)
            return null;

        EventResponse builder = EventResponse.builder()
                .id(event.getId())
                .slug(event.getSlug())
                .organization(OrganizationResponse.from(event.getOrganization()))
                .creator(creator)
                .approver(approver)
                .title(event.getTitle())
                .description(event.getDescription())
                .eventTopic(event.getEventTopic())
                .coverImage(event.getCoverImage())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .registrationDeadline(event.getRegistrationDeadline())
                .location(event.getLocation())
                .eventMode(event.getEventMode())
                .maxParticipants(event.getMaxParticipants())
                .registeredCount(registeredCount)
                .type(event.getType())
                .status(event.getStatus())
                .hasLuckyDraw(event.isHasLuckyDraw())
                .notes(event.getNotes())
                .additionalInfo(event.getAdditionalInfo())
                .checkInEnabled(event.isCheckInEnabled())
                .qrType(event.getQrType())
                .isDeleted(event.isDeleted())
                .customFieldsJson(event.getCustomFieldsJson())
                .targetObjects(event.getTargetObjects())
                .recipients(event.getRecipients())
                .currentUserRole(currentUserRole)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();

        // Map Collections
        if (event.getRegistrations() != null && userMap != null) {
            builder.setRegistrations(event.getRegistrations().stream()
                    .map(r -> EventRegistrationResponse.from(r,
                            userMap.get(r.getParticipantAccountId()),
                            userMap.get(r.getCheckedInByAccountId())))
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getOrganizers() != null && userMap != null) {
            builder.setOrganizers(event.getOrganizers().stream()
                    .map(o -> EventOrganizerResponse.from(o, userMap.get(o.getAccountId())))
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getPresenters() != null && userMap != null) {
            builder.setPresenters(event.getPresenters().stream()
                    .map(p -> EventPresenterResponse.from(p, userMap.get(p.getPresenterAccountId())))
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getSessions() != null) {
            builder.setSessions(event.getSessions().stream()
                    .map(s -> EventSessionResponse.from(s,
                            (userMap != null && s.getPresenter() != null)
                                    ? userMap.get(s.getPresenter().getPresenterAccountId())
                                    : null))
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getPosts() != null && userMap != null) {
            builder.setPosts(event.getPosts().stream()
                    .map(p -> EventPostResponse.from(p, userMap.get(p.getAuthorAccountId())))
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getFeedbacks() != null && userMap != null) {
            builder.setFeedbacks(event.getFeedbacks().stream()
                    .map(f -> EventFeedbackResponse.from(f, userMap.get(f.getReviewerAccountId())))
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getInvitations() != null && userMap != null) {
            builder.setInvitations(event.getInvitations().stream()
                    .map(i -> {
                        String emailKey = i.getInviteeEmail() != null ? i.getInviteeEmail().trim().toLowerCase() : null;
                        UserResponse invitee = (emailKey != null) ? userMap.get(emailKey) : null;
                        UserResponse inviter = (i.getInviterAccountId() != null) ? userMap.get(i.getInviterAccountId())
                                : null;

                        return EventInvitationResponse.from(i, invitee, inviter);
                    })
                    .collect(java.util.stream.Collectors.toList()));
        }

        builder.setRecap(RecapResponse.from(event.getRecap()));

        if (event.getQuizzes() != null) {
            builder.setQuizzes(event.getQuizzes().stream()
                    .map(QuizDto::from)
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (event.getSurvey() != null) {
            builder.setSurvey(SurveyDto.from(event.getSurvey()));
        }

        return builder;
    }

    // Keep old signature for backward compatibility if needed, but update it to
    // call new one with empty map
    public static EventResponse from(Event event, UserResponse creator, UserResponse approver, int registeredCount,
            EventUserRoleResponse currentUserRole) {
        return from(event, creator, approver, registeredCount, currentUserRole, java.util.Collections.emptyMap());
    }
}
