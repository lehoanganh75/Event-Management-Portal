package src.main.eventservice.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.dto.UserDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventTemplate;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.repository.EventRepository;
import src.main.eventservice.repository.EventTemplateRepository;
import src.main.eventservice.service.EventService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventTemplateRepository eventTemplateRepository;

    @Override
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAllByIsDeletedFalseOrderByStartTimeDesc();
        events.forEach(this::enrichEventWithRegistrationCount);
        return events;
    }

    @Override
    public List<Event> getFeaturedEvents() {
        List<Event> candidates = eventRepository.findCandidateEvents();
        LocalDateTime now = LocalDateTime.now();

        candidates.forEach(this::enrichEventWithRegistrationCount);

        return candidates.stream()
                .sorted(Comparator.comparingDouble(event -> -calculateScore(event, now)))
                .limit(6)
                .collect(Collectors.toList());
    }

    private double calculateScore(Event event, LocalDateTime now) {
        double score = 0;

        score += Math.log(event.getRegisteredCount() + 1) * 10;

        if (event.getFeedbacks() != null) {
            score += event.getFeedbacks().size() * 0.2;
        }

        if (event.getPosts() != null) {
            score += event.getPosts().size() * 0.1;
        }

        if (event.getStartTime() != null && event.getEndTime() != null
                && now.isAfter(event.getStartTime())
                && now.isBefore(event.getEndTime())) {
            score += 30;
        }

        if (event.getStartTime() != null
                && now.isBefore(event.getStartTime())
                && event.getStartTime().isBefore(now.plusDays(3))) {
            score += 20;
        }

        if (event.getLuckyDrawId() != null && !event.getLuckyDrawId().isBlank()) {
            score += 10;
        }

        if (event.getRecap() != null) score += 5;

        if (event.getMaxParticipants() > 0) {
            double fillRate = (double) event.getRegisteredCount() / event.getMaxParticipants();
            if (fillRate >= 0.8) score += 15;
        }

        if (event.getStartTime() != null) {
            long daysDiff = Math.abs(Duration.between(event.getStartTime(), now).toDays());
            score -= daysDiff * 2;
        }

        return score;
    }

    @Override
    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }
    @Override
    public List<Event> getMyEventsByAccountAndMonth(String accountId) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1);

        return eventRepository.findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
                accountId, startOfMonth, endOfMonth
        );
    }

    @Override
    public Event createEvent(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setDeleted(false);
        event.setArchived(false);
        event.setFinalized(false);

        if (event.getStatus() == null) {
            event.setStatus(EventStatus.DRAFT);
        }

        return eventRepository.save(event);
    }

    @Override
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public Page<Event> getAllEvents(PageRequest pageable) {
        return eventRepository.findAll(pageable);
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
            existingEvent.setFinalized(eventDetails.isFinalized());
            existingEvent.setArchived(eventDetails.isArchived());
            existingEvent.setApprovedByAccountId(eventDetails.getApprovedByAccountId());
            existingEvent.setOrganizerUnit(eventDetails.getOrganizerUnit());
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));
        event.setDeleted(true);
        event.setArchived(true);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }

    @Transactional
    @Override
    public void updateLuckyDrawId(String id, String luckyDrawId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));
        event.setLuckyDrawId(luckyDrawId);
        eventRepository.save(event);
    }

    @Override
    public List<Event> getAllPlans() {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PENDING_APPROVAL,
                EventStatus.CANCELLED
        );
        return eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
    }

    @Override
    public List<Event> getPlansByStatus(EventStatus status) {
        List<EventStatus> planStatuses = Collections.singletonList(status);
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Override
    public List<Event> getPlansByStatusById(EventStatus status, String accountId) {
        List<EventStatus> planStatuses = Collections.singletonList(status);
        List<Event> plans = eventRepository
                .findByStatusInAndIsDeletedFalseAndCreatedByAccountId(planStatuses, accountId);
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
            event.setStatus(EventStatus.DRAFT);
        }

        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề kế hoạch không được để trống");
        }

        if (event.getTemplateId() != null && !event.getTemplateId().trim().isEmpty()) {
            EventTemplate template = eventTemplateRepository.findById(event.getTemplateId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy template"));
            template.setUsageCount(template.getUsageCount() + 1);
            eventTemplateRepository.save(template);
        }

        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event updatePlan(String id, Event planDetails) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch"));

        if (existingEvent.getStatus() == EventStatus.PUBLISHED ||
                existingEvent.getStatus() == EventStatus.ONGOING) {
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
        event.setDeleted(true);
        event.setArchived(true);
        eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event updateEventStatus(String id, EventStatus status, String approverId, String accountId) {
        return eventRepository.findById(id).map(event -> {
            event.setStatus(status);
            event.setUpdatedAt(LocalDateTime.now());

            if (status == EventStatus.PUBLISHED && approverId != null) {
                event.setApprovedByAccountId(approverId);
            }

            if (status == EventStatus.CANCELLED) {
                event.setApprovedByAccountId(null);
            }

            return eventRepository.save(event);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện/kế hoạch với ID: " + id));
    }

    private void enrichEventWithRegistrationCount(Event event) {
        long count = eventRepository.countRegistrationsByEventId(event.getId());
        event.setRegisteredCount((int) count);
    }

    @Override
    public List<PlanResponseDto> getAllPlansEnriched() {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PENDING_APPROVAL,
                EventStatus.CANCELLED
        );

        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);

        return plans.stream()
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansByAccountId(String accountId) {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PENDING_APPROVAL,
                EventStatus.CANCELLED
        );

        List<Event> plans = eventRepository
                .findByStatusInAndIsDeletedFalseAndCreatedByAccountId(planStatuses, accountId);

        return plans.stream()
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByAccountId(String accountId) {
        List<EventStatus> eventStatuses = Arrays.asList(
                EventStatus.PENDING_APPROVAL,
                EventStatus.PUBLISHED,
                EventStatus.ONGOING,
                EventStatus.COMPLETED,
                EventStatus.CANCELLED
        );

        List<Event> events = eventRepository
                .findByStatusInAndIsDeletedFalseAndCreatedByAccountId(eventStatuses, accountId);

        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByStatus(EventStatus status) {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));

        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }
}