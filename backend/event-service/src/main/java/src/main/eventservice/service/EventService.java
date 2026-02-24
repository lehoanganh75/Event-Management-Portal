package src.main.eventservice.service;

import jakarta.transaction.Transactional;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.enums.EventStatus;

import java.util.List;
import java.util.Optional;

public interface EventService {
    // Lấy toàn bộ danh sách sự kiện
    List<Event> getAllEvents();

    List<Event> getFeaturedEvents();

    // Tìm một sự kiện theo ID
    Optional<Event> getEventById(String id);

    // Lưu hoặc cập nhật sự kiện
    Event saveEvent(Event event);

    @Transactional
        // Đảm bảo tính toàn vẹn dữ liệu khi update
    Event updateEvent(String id, Event eventDetails);

    // Xóa sự kiện
    void deleteEvent(String id);

    // Plans
    List<Event> getAllPlans();

    @Transactional
    Event createPlan(Event event);

    @Transactional
    Event updatePlan(String id, Event planDetails);

    @Transactional
    void deletePlan(String id);

    @Transactional
    Event updateEventStatus(String id, EventStatus status, String approverId);
}
