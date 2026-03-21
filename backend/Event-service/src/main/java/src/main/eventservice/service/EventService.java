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

    Optional<Event> getEventById(String id);

    List<Event> getMyEventsByAccountAndMonth(String accountId);

    Event createEvent(Event event);

    Event saveEvent(Event event);

    @Transactional
    Event updateEvent(String id, Event eventDetails);

    void deleteEvent(String id);

    void updateLuckyDrawId(String id, String luckyDrawId);

    List<Event> getAllPlans();

    List<Event> getPlansByStatus(EventStatus status);

    List<Event> getPlansByStatusById(EventStatus status, String accountId);

    @Transactional
    Event createPlan(Event event);

    @Transactional
    Event updatePlan(String id, Event planDetails);

    @Transactional
    void deletePlan(String id);

    @Transactional
    Event updateEventStatus(String id, EventStatus status, String approverId, String accountId);

    List<PlanResponseDto> getAllPlansEnriched();

    List<PlanResponseDto> getPlansByAccountId(String accountId);

    List<PlanResponseDto> getEventsByAccountId(String accountId);

    List<PlanResponseDto> getEventsByStatus(EventStatus status);
}