package src.main.eventservice.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.enums.EventStatus;

import java.util.List;
import java.util.Optional;

public interface EventService {

    List<Event> getAllEvents();

    Page<Event> getAllEvents(PageRequest pageable);

    List<Event> getFeaturedEvents();

    Optional<Event> findById(String id);

    Optional<Event> getEventById(String id);

    List<Event> getMyEventsByAccountAndMonth(String accountId);

    Event createEvent(Event event);

    void deleteEvent(String id);

    List<Event> getEventsByStatuses(List<EventStatus> statuses);

    Event saveEvent(Event event);

    Event updateEvent(String id, Event eventDetails);

    void updateLuckyDrawId(String id, String luckyDrawId);

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

    Event updateEventStatus(String id, EventStatus status, String approverId, String accountId);

    List<PlanResponseDto> getAllPlansEnriched();

    List<PlanResponseDto> getPlansByAccountId(String accountId);

    List<PlanResponseDto> getEventsByAccountId(String accountId);

    List<PlanResponseDto> getEventsByStatus(EventStatus status);

    List<PlanResponseDto> getPlansPendingApproval();

    List<PlanResponseDto> getEventsPendingApproval();
}
