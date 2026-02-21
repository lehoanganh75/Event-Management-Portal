package src.main.eventservice.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import src.main.eventservice.EventService;
import src.main.eventservice.entity.Event;
import src.main.eventservice.repository.EventRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Override
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        events.forEach(this::enrichEventWithRegistrationCount);
        return events;
    }
    @Override
    public List<Event> getFeaturedEvents() {
        Pageable topTwo = PageRequest.of(0, 2);
        List<Event> events = eventRepository.findOngoingEvents(topTwo);
            
        events.forEach(this::enrichEventWithRegistrationCount);

        return events;
    }

    // Hàm bổ trợ để tái sử dụng logic đếm
    private void enrichEventWithRegistrationCount(Event event) {
        long count = eventRepository.countRegistrationsByEventId(event.getId());
        event.setRegisteredCount((int) count);
    }
    @Override
    public Optional<Event> getEventById(String id) { // Giữ nguyên String
        return eventRepository.findById(id);
    }

    @Override
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public void deleteEvent(String id) { // Sửa tham số thành String id
        eventRepository.deleteById(id);
    }
}