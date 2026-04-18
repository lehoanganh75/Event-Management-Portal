package com.eventservice.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.eventservice.dto.PlanResponseDto;
import com.eventservice.entity.Event;
import com.eventservice.entity.enums.EventStatus;

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

    Optional<Event> getEventById(String id, String accountId);

    @Transactional
    void updateLuckyDrawId(String id);

    Event createEvent(Event event);

    @Transactional
    Event saveEvent(Event event);

    Page<Event> getAllEvents(PageRequest pageable);

    Event updateEvent(String id, Event eventDetails);

    @Transactional
    void deleteEvent(String id);

    @Transactional
    List<Event> getEventsByStatuses(List<String> statuses);

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

    public Map<String, String> invitateParticipants(String eventId, String organizerId, List<String> inviteeIds);

    Map<String, String> acceptInvite(String eventId, String token);
}
