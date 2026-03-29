package src.main.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventOrganizer;
import src.main.eventservice.entity.enums.OrganizerRole;
import src.main.eventservice.repository.EventOrganizerRepository;
import src.main.eventservice.repository.EventRepository;
import src.main.eventservice.service.EventOrganizerService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventOrganizerServiceImpl implements EventOrganizerService {

    private final EventOrganizerRepository organizerRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public EventOrganizer addOrganizer(String eventId, EventOrganizer organizer) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + eventId));
        organizer.setEvent(event);
        organizer.setAssignedAt(LocalDateTime.now());
        return organizerRepository.save(organizer);
    }

    @Override
    public List<EventOrganizer> getOrganizers(String eventId) {
        return organizerRepository.findByEventId(eventId);
    }

    @Override
    @Transactional
    public void removeOrganizer(String organizerId) {
        if (!organizerRepository.existsById(organizerId)) {
            throw new RuntimeException("Không tìm thấy thành viên ban tổ chức với ID: " + organizerId);
        }
        organizerRepository.deleteById(organizerId);
    }

    @Transactional
    @Override
    public EventOrganizer updateOrganizerRole(String organizerId, OrganizerRole role) {
        EventOrganizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên ban tổ chức với ID: " + organizerId));
        organizer.setRole(role);
        return organizerRepository.save(organizer);
    }
}