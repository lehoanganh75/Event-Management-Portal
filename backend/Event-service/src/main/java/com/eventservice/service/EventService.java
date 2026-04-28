package com.eventservice.service;

import com.eventservice.entity.EventInvitation;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.eventservice.dto.PlanResponseDto;
import com.eventservice.entity.Event;
import com.eventservice.entity.enums.EventStatus;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface EventService {
    // Lấy sự kiện cho xem (trang chủ, trang danh sách sự kiện)
    List<Event> findEventsForUser();

    // Lấy sự kiện đang diễn ra hôm nay
    List<Event> getOngoingEvents();

    List<Event> getCompletedEvents();

    // Lấy sự kiện sắp diễn ra trong tuần này
    List<Event> getUpcomingEventsThisWeek();

    // Lấy sự kiện nổi bật nhất (Featured)
    List<Event> getFeaturedEvents();

    // Lấy sự kiện cho admin và super admin xem (trang quản lý sự kiện)
    List<Event> findEventsForAdmin();

    List<Event> findMyEventsByRole(String accountId, String roleType);

    List<Event> getMyEventsByAccountAndMonth(String accountId, String roleType, int month, int year);

    Event getEventById(String id, String accountId);

    @Transactional
    void updateLuckyDrawId(String id, boolean hasLuckyDraw);

    Event createEvent(Event event, List<String> organizerIds, List<Map<String, Object>> presenterIds,
            List<Map<String, Object>> invitations, MultipartFile file);

    @Transactional
    Event saveEvent(Event event);

    Page<Event> getAllEvents(PageRequest pageable);

    Event updateEvent(String id, Event eventDetails);

    @Transactional
    void deleteEvent(String id);

    @Transactional
    List<Event> getEventsByStatuses(List<String> statuses, String accountId);

    List<Event> getAllPlans();

    List<Event> getPlansByStatus(EventStatus status);

    List<Event> getPlansByStatusById(EventStatus status, String accountId);

    Event createPlan(Event event);

    Event updatePlan(String id, Event planDetails);

    void deletePlan(String id);

    Event submitPlanForApproval(String id);

    Event approvePlan(String id, String approverId);

    Event rejectPlan(String id, String approverId, String reason);

    Event createEventFromPlan(String planId, Event eventDetails);

    Event approveEvent(String id, String approverId);

    Event rejectEvent(String id, String approverId, String reason);

    Event startEvent(String id);

    Event completeEvent(String id);

    Event cancelEvent(String id, String reason);

    List<PlanResponseDto> getAllPlansEnriched();

    List<PlanResponseDto> getPlansByAccountId(String accountId);

    List<PlanResponseDto> getEventsByStatus(EventStatus status);

    List<PlanResponseDto> getPlansPendingApproval();

    List<PlanResponseDto> getEventsPendingApproval();

    Event updateEventStatus(String id, EventStatus status, String approverId, String accountId);

    Map<String, String> inviteParticipants(String eventId, String organizerId,
            com.eventservice.dto.InvitationBatchRequest request);

    Map<String, String> acceptInvite(String eventId, String token);

    EventInvitation getInvitationByToken(String eventId, String token);

    Map<String, String> rejectInvite(String eventId, String token, String reason);

    @Transactional
    void sendOrganizerInvitations(String eventId, List<Map<String, Object>> invitations);

    @Transactional
    void sendPresenterInvitations(String eventId, List<Map<String, Object>> invitations);

    @Transactional
    void cancelInvitation(String invitationId);

    com.eventservice.dto.EventSummaryDto getEventSummary(String id);

    List<Event> findEventsByOrganization(String orgId);

    List<Event> findEventsByOrganizationOwner(String ownerId);

    Map<String, Long> getQuickStats();

    Map<String, Object> getLecturerStats(String accountId);

    Event saveDraft(Event event);

    List<String> getOrganizerRoles(String accountId);
}
