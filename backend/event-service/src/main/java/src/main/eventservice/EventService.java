package src.main.eventservice;

import src.main.eventservice.entity.Event;

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

    // Xóa sự kiện
    void deleteEvent(String id);
}
