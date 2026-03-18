package src.main.eventservice.service.impl;

import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import src.main.eventservice.entity.EventTemplate;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.repository.EventTemplateRepository;
import src.main.eventservice.service.EventService;
import src.main.eventservice.entity.Event;
import src.main.eventservice.repository.EventRepository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventTemplateRepository eventTemplateRepository;

    @Override
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();

        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<Event> getFeaturedEvents() {
        Pageable topTwo = PageRequest.of(0, 2);
        List<Event> events = eventRepository.findOngoingEvents(topTwo);
            
        events.forEach(this::enrichEventWithRegistrationCount);

        return events;
    }

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



    @Transactional
    @Override
    public Event updateEvent(String id, Event eventDetails) {
        return eventRepository.findById(id).map(existingEvent -> {
            existingEvent.setTitle(eventDetails.getTitle());
            existingEvent.setDescription(eventDetails.getDescription());
            existingEvent.setEventTopic(eventDetails.getEventTopic());
            existingEvent.setCoverImage(eventDetails.getCoverImage());
            existingEvent.setLocation(eventDetails.getLocation());
            existingEvent.setEventMode(eventDetails.getEventMode());
            existingEvent.setMaxParticipants(eventDetails.getMaxParticipants());

            existingEvent.setStartTime(eventDetails.getStartTime());
            existingEvent.setEndTime(eventDetails.getEndTime());
            existingEvent.setRegistrationDeadline(eventDetails.getRegistrationDeadline());

            existingEvent.setStatus(eventDetails.getStatus());
            existingEvent.setHasLuckyDraw(eventDetails.isHasLuckyDraw());
            existingEvent.setFinalized(eventDetails.isFinalized());
            existingEvent.setArchived(eventDetails.isArchived());

            existingEvent.setApprovedByAccountId(eventDetails.getApprovedByAccountId());

            existingEvent.setParticipants(eventDetails.getParticipants());
            existingEvent.setOrganizerUnit(eventDetails.getOrganizerUnit());
            existingEvent.setRecipients(eventDetails.getRecipients());
            existingEvent.setCustomRecipients(eventDetails.getCustomRecipients());
            existingEvent.setPresenters(eventDetails.getPresenters());
            existingEvent.setOrganizingCommittee(eventDetails.getOrganizingCommittee());
            existingEvent.setAttendees(eventDetails.getAttendees());
            existingEvent.setNotes(eventDetails.getNotes());
            existingEvent.setAdditionalInfo(eventDetails.getAdditionalInfo());
            existingEvent.setCustomFieldsJson(eventDetails.getCustomFieldsJson());

            existingEvent.setUpdatedAt(LocalDateTime.now());

            return eventRepository.save(existingEvent);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));
    }

    @Override
    public void deleteEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        event.setDeletedAt(LocalDateTime.now());
        event.setStatus(EventStatus.Cancelled);
        eventRepository.save(event);
    }
    // Plans
    @Override
    public List<Event> getAllPlans() {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.Draft,
                EventStatus.PendingApproval,
                EventStatus.Cancelled
        );
        return eventRepository.findByStatusInAndDeletedAtIsNull(planStatuses);
    }

    @Override
    public List<Event> getPlansByStatus(EventStatus status) {
        List<EventStatus> planStatuses = Arrays.asList(status);
        List<Event> plans = eventRepository.findByStatusInAndDeletedAtIsNull(planStatuses);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Transactional
    @Override
    public Event createPlan(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setArchived(false);
        event.setFinalized(false);
        if (event.getStatus() == null) {
            event.setStatus(EventStatus.Draft);
        }
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề kế hoạch không được để trống");
        }

        if (event.getTemplateId() != null && !event.getTemplateId().trim().isEmpty()) {
            EventTemplate originalTemplate = eventTemplateRepository.findById(event.getTemplateId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy template với ID: " + event.getTemplateId()));

            originalTemplate.setUsageCount(originalTemplate.getUsageCount() + 1);
            eventTemplateRepository.save(originalTemplate);
        }
        return eventRepository.save(event);
    }
    @Transactional
    @Override
    public Event updatePlan(String id, Event planDetails) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch"));

        if (existingEvent.getStatus() == EventStatus.Published || existingEvent.getStatus() == EventStatus.Ongoing) {
            throw new RuntimeException("Không thể sửa kế hoạch đã được công bố hoặc đang diễn ra");
        }

        existingEvent.setTitle(planDetails.getTitle());
        existingEvent.setDescription(planDetails.getDescription());
        existingEvent.setStartTime(planDetails.getStartTime());
        existingEvent.setEndTime(planDetails.getEndTime());
        existingEvent.setRegistrationDeadline(planDetails.getRegistrationDeadline());
        existingEvent.setMaxParticipants(planDetails.getMaxParticipants());
        existingEvent.setLocation(planDetails.getLocation());
        existingEvent.setUpdatedAt(LocalDateTime.now());

        return eventRepository.save(existingEvent);
    }

    @Transactional
    @Override
    public void deletePlan(String id) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setDeletedAt(LocalDateTime.now());
        event.setArchived(true);
        eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event updateEventStatus(String id, EventStatus status, String approverId) {
        return eventRepository.findById(id).map(event -> {
            event.setStatus(status);
            event.setUpdatedAt(LocalDateTime.now());

            if (status == EventStatus.Published && approverId != null) {
                event.setApprovedByAccountId(approverId);
            }

            return eventRepository.save(event);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện/kế hoạch với ID: " + id));
    }

    @Override
    public Page<Event> getAllEvents(PageRequest pageable) {
        return null;
    }
}