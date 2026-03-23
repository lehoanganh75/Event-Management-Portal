package src.main.eventservice.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import src.main.eventservice.client.IdentityServiceClient;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.dto.UserDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventRegistration;
import src.main.eventservice.entity.EventTemplate;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.entity.enums.RegistrationStatus;
import src.main.eventservice.repository.EventRegistrationRepository;
import src.main.eventservice.repository.EventRepository;
import src.main.eventservice.repository.EventTemplateRepository;
import src.main.eventservice.service.EventService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventTemplateRepository eventTemplateRepository;
    private final EventRegistrationRepository registrationRepository;
    private final IdentityServiceClient identityClient;

    @Override
    public List<Event> getAllEvents() {
        List<EventStatus> eventStatuses = Arrays.asList(
                EventStatus.EVENT_PENDING_APPROVAL,
                EventStatus.PUBLISHED,
                EventStatus.ONGOING,
                EventStatus.COMPLETED,
                EventStatus.CANCELLED
        );
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(eventStatuses);
        events.forEach(this::enrichEventWithRegistrationCount);
        return events;
    }

    @Override
    public List<Event> getFeaturedEvents() {
        List<EventStatus> eventStatuses = Arrays.asList(
                EventStatus.PUBLISHED,
                EventStatus.ONGOING,
                EventStatus.COMPLETED
        );
        List<Event> candidates = eventRepository.findByStatusInAndIsDeletedFalse(eventStatuses);
        LocalDateTime now = LocalDateTime.now();

        candidates.forEach(this::enrichEventWithRegistrationCount);

        return candidates.stream()
                .sorted(Comparator.comparingDouble((Event event) -> -calculateScore(event, now)))
                .limit(6)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Event> findById(String id) {
        Optional<Event> eventOptional = eventRepository.findById(id);
        eventOptional.ifPresent(this::enrichEventWithValidRegistrationCount);
        return eventOptional;
    }

    @Override
    public Optional<Event> getEventById(String id) {
        return findById(id);
    }

    private void enrichEventWithValidRegistrationCount(Event event) {
        List<RegistrationStatus> validStatuses = Arrays.asList(
                RegistrationStatus.REGISTERED,
                RegistrationStatus.ATTENDED
        );
        long count = registrationRepository.countByEventIdAndStatusIn(event.getId(), validStatuses);
        event.setRegisteredCount((int) count);
    }

    private double calculateScore(Event event, LocalDateTime now) {
        double score = 0;
        score += Math.log(event.getRegisteredCount() + 1) * 10;

        if (event.getFeedbacks() != null) score += event.getFeedbacks().size() * 0.2;
        if (event.getPosts() != null) score += event.getPosts().size() * 0.1;

        if (event.getStartTime() != null && event.getEndTime() != null
                && now.isAfter(event.getStartTime()) && now.isBefore(event.getEndTime())) {
            score += 30;
        }

        if (event.getStartTime() != null && now.isBefore(event.getStartTime())
                && event.getStartTime().isBefore(now.plusDays(3))) {
            score += 20;
        }

        if (event.getLuckyDrawId() != null && !event.getLuckyDrawId().isBlank()) score += 10;
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
    public List<Event> getMyEventsByAccountAndMonth(String accountId) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1);
        return eventRepository.findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
                accountId, startOfMonth, endOfMonth
        );
    }

    @Override
    @Transactional
    public Event createEvent(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setDeleted(false);
        event.setArchived(false);
        event.setFinalized(false);
        if (event.getStatus() == null) event.setStatus(EventStatus.DRAFT);
        return eventRepository.save(event);
    }

    @Override
    @Transactional
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
    @Transactional
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
    @Transactional
    public List<Event> getEventsByStatuses(List<EventStatus> statuses) {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(statuses);
        events.forEach(this::enrichEventWithRegistrationCount);
        return events;
    }

    @Override
    public List<Event> getAllPlans() {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED,
                EventStatus.CANCELLED
        );
        return eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
    }

    @Override
    public List<Event> getPlansByStatus(EventStatus status) {
        if (!isPlanStatus(status)) throw new IllegalArgumentException("Status không thuộc giai đoạn kế hoạch");
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Override
    public List<Event> getPlansByStatusById(EventStatus status, String accountId) {
        if (!isPlanStatus(status)) throw new IllegalArgumentException("Status không thuộc giai đoạn kế hoạch");
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(Collections.singletonList(status), accountId);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Transactional
    @Override
    public Event createPlan(Event event) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) throw new IllegalArgumentException("Tiêu đề không được trống");
        if (event.getCreatedByAccountId() == null) throw new IllegalArgumentException("Thiếu người tạo");

        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setDeleted(false);
        if (event.getStatus() == null) event.setStatus(EventStatus.DRAFT);

        if (event.getTemplateId() != null && !event.getTemplateId().trim().isEmpty()) {
            eventTemplateRepository.findById(event.getTemplateId()).ifPresent(t -> {
                t.setUsageCount(t.getUsageCount() + 1);
                eventTemplateRepository.save(t);
            });
        }
        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event updatePlan(String id, Event planDetails) {
        Event existing = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch"));
        if (existing.getStatus() == EventStatus.PLAN_PENDING_APPROVAL || existing.getStatus() == EventStatus.PLAN_APPROVED) {
            throw new RuntimeException("Kế hoạch đã gửi duyệt hoặc đã duyệt, không thể sửa");
        }
        existing.setTitle(planDetails.getTitle());
        existing.setDescription(planDetails.getDescription());
        existing.setStartTime(planDetails.getStartTime());
        existing.setEndTime(planDetails.getEndTime());
        existing.setLocation(planDetails.getLocation());
        existing.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(existing);
    }

    @Transactional
    @Override
    public void deletePlan(String id) {
        deleteEvent(id);
    }

    @Transactional
    @Override
    public Event submitPlanForApproval(String id) {
        Event plan = eventRepository.findById(id).orElseThrow();
        if (plan.getStatus() != EventStatus.DRAFT) throw new RuntimeException("Chỉ có thể gửi duyệt bản DRAFT");
        plan.setStatus(EventStatus.PLAN_PENDING_APPROVAL);
        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event approvePlan(String id, String approverId) {
        Event plan = eventRepository.findById(id).orElseThrow();
        if (plan.getStatus() != EventStatus.PLAN_PENDING_APPROVAL) throw new RuntimeException("Kế hoạch không ở trạng thái chờ duyệt");
        plan.setStatus(EventStatus.PLAN_APPROVED);
        plan.setApprovedByAccountId(approverId);
        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event rejectPlan(String id, String approverId, String reason) {
        Event plan = eventRepository.findById(id).orElseThrow();
        plan.setStatus(EventStatus.CANCELLED);
        plan.setNotes(reason);
        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event createEventFromPlan(String planId, Event eventDetails) {
        Event plan = eventRepository.findById(planId).orElseThrow();
        if (plan.getStatus() != EventStatus.PLAN_APPROVED) throw new RuntimeException("Kế hoạch chưa được duyệt");

        Event newEvent = new Event();
        newEvent.setTitle(Optional.ofNullable(eventDetails.getTitle()).orElse(plan.getTitle()));
        newEvent.setDescription(Optional.ofNullable(eventDetails.getDescription()).orElse(plan.getDescription()));
        newEvent.setStartTime(Optional.ofNullable(eventDetails.getStartTime()).orElse(plan.getStartTime()));
        newEvent.setEndTime(Optional.ofNullable(eventDetails.getEndTime()).orElse(plan.getEndTime()));
        newEvent.setLocation(Optional.ofNullable(eventDetails.getLocation()).orElse(plan.getLocation()));
        newEvent.setMaxParticipants(eventDetails.getMaxParticipants() > 0 ? eventDetails.getMaxParticipants() : plan.getMaxParticipants());
        newEvent.setOrganizerUnit(plan.getOrganizerUnit());
        newEvent.setCreatedByAccountId(eventDetails.getCreatedByAccountId());
        newEvent.setStatus(EventStatus.EVENT_PENDING_APPROVAL);
        newEvent.setCreatedAt(LocalDateTime.now());
        return eventRepository.save(newEvent);
    }

    @Transactional
    @Override
    public Event approveEvent(String id, String approverId) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.PUBLISHED);
        event.setApprovedByAccountId(approverId);
        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event startEvent(String id) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.ONGOING);
        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event completeEvent(String id) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.COMPLETED);
        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event cancelEvent(String id, String reason) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.CANCELLED);
        if (reason != null) event.setNotes(reason);
        return eventRepository.save(event);
    }

    private void enrichEventWithRegistrationCount(Event event) {
        long count = eventRepository.countRegistrationsByEventId(event.getId());
        event.setRegisteredCount((int) count);
    }

    private boolean isPlanStatus(EventStatus status) {
        return status == EventStatus.DRAFT || status == EventStatus.PLAN_PENDING_APPROVAL || status == EventStatus.PLAN_APPROVED;
    }

    private boolean isEventStatus(EventStatus status) {
        return status == EventStatus.EVENT_PENDING_APPROVAL || status == EventStatus.PUBLISHED || status == EventStatus.ONGOING || status == EventStatus.COMPLETED;
    }

    @Override
    public List<PlanResponseDto> getAllPlansEnriched() {
        List<EventStatus> planStatuses = Arrays.asList(EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL, EventStatus.PLAN_APPROVED, EventStatus.CANCELLED);
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
        if (plans.isEmpty()) return Collections.emptyList();

        Set<String> allUserIds = plans.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(id -> id != null && !id.isBlank()).collect(Collectors.toSet());

        Map<String, UserDto> userMap = new HashMap<>();
        try {
            if (!allUserIds.isEmpty()) {
                userMap = identityClient.getUsersByIds(new ArrayList<>(allUserIds)).stream()
                        .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
            }
        } catch (Exception e) { log.error("Identity Service Error: {}", e.getMessage()); }

        final Map<String, UserDto> finalUserMap = userMap;
        return plans.stream().map(e -> PlanResponseDto.from(e, finalUserMap.get(e.getCreatedByAccountId()), finalUserMap.get(e.getApprovedByAccountId()))).collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansByAccountId(String accountId) {
        List<EventStatus> planStatuses = Arrays.asList(EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL, EventStatus.PLAN_APPROVED, EventStatus.CANCELLED);
        return eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(planStatuses, accountId).stream()
                .map(e -> PlanResponseDto.from(e, null, null)).collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByAccountId(String accountId) {
        List<EventStatus> eventStatuses = Arrays.asList(EventStatus.EVENT_PENDING_APPROVAL, EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.CANCELLED);
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(eventStatuses, accountId);
        events.forEach(this::enrichEventWithRegistrationCount);
        return events.stream().sorted(Comparator.comparing(Event::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(e -> PlanResponseDto.from(e, null, null)).collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByStatus(EventStatus status) {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));
        events.forEach(this::enrichEventWithRegistrationCount);
        return events.stream().sorted(Comparator.comparing(Event::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(e -> PlanResponseDto.from(e, null, null)).collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansPendingApproval() {
        return eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(EventStatus.PLAN_PENDING_APPROVAL)).stream()
                .map(e -> PlanResponseDto.from(e, null, null)).collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsPendingApproval() {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(EventStatus.EVENT_PENDING_APPROVAL));
        events.forEach(this::enrichEventWithRegistrationCount);
        return events.stream().map(e -> PlanResponseDto.from(e, null, null)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Event updateEventStatus(String id, EventStatus status, String approverId, String accountId) {
        switch (status) {
            case PLAN_PENDING_APPROVAL: return submitPlanForApproval(id);
            case PLAN_APPROVED: return approvePlan(id, approverId);
            case PUBLISHED: return approveEvent(id, approverId);
            case ONGOING: return startEvent(id);
            case COMPLETED: return completeEvent(id);
            case CANCELLED: return cancelEvent(id, null);
            default: throw new RuntimeException("Trạng thái không hỗ trợ: " + status);
        }
    }
}