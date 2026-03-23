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

    List<Event> getFeaturedEvents();

    Optional<Event> findById(String id);

    List<Event> getMyEventsByAccountAndMonth(String accountId);

    Event createEvent(Event event);

    void deleteEvent(String id);

    List<Event> getEventsByStatuses(List<EventStatus> statuses);

    // Tìm một sự kiện theo ID
    Optional<Event> getEventById(String id);

    // Lưu hoặc cập nhật sự kiện
    Event saveEvent(Event event);

    @Transactional
        // Đảm bảo tính toàn vẹn dữ liệu khi update
    Event updateEvent(String id, Event eventDetails);

    void updateLuckyDrawId(String id, String luckyDrawId);

    // Plans
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

    Page<Event> getAllEvents(PageRequest pageable);

    List<PlanResponseDto> getAllPlansEnriched();

    List<PlanResponseDto> getPlansByAccountId(String accountId);

    List<PlanResponseDto> getEventsByAccountId(String accountId);
}
