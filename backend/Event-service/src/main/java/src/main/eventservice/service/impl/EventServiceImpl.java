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
import src.main.eventservice.entity.EventOrganizer;
import src.main.eventservice.entity.EventParticipant;
import src.main.eventservice.entity.EventPresenter;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.entity.enums.ParticipationStatus;
import src.main.eventservice.repository.*;
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
    private final IdentityServiceClient identityClient;
    private final EventPresenterRepository presenterRepository;
    private final EventOrganizerRepository organizerRepository;
    private final EventParticipantRepository participantRepository;

    @Override
    public List<Event> getAllEvents() {
        List<EventStatus> statuses = List.of(
                EventStatus.EVENT_PENDING_APPROVAL,
                EventStatus.PUBLISHED,
                EventStatus.ONGOING,
                EventStatus.COMPLETED,
                EventStatus.CANCELLED
        );
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(statuses);

        for (Event event : events) {
            List<EventPresenter> presenters = presenterRepository.findByEventId(event.getId());
            List<EventOrganizer> organizers = organizerRepository.findByEventId(event.getId());
            List<EventParticipant> participants = participantRepository.findByEventId(event.getId());

            event.setPresenters(presenters);
            event.setOrganizers(organizers);
            event.setParticipants(participants);

            enrichEventWithRegistrationCount(event);
        }

        return events;
    }

    @Override
    public List<Event> getFeaturedEvents() {
        List<EventStatus> statuses = List.of(
                EventStatus.PUBLISHED,
                EventStatus.ONGOING,
                EventStatus.COMPLETED
        );
        List<Event> candidates = eventRepository.findByStatusInAndIsDeletedFalse(statuses);
        LocalDateTime now = LocalDateTime.now();

        candidates.forEach(this::enrichEventWithRegistrationCount);

        return candidates.stream()
                .sorted(Comparator.comparingDouble(e -> -calculateScore(e, now)))
                .limit(6)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Event> findById(String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        eventOpt.ifPresent(this::enrichEventWithRegistrationCount);
        return eventOpt;
    }

    @Override
    public Optional<Event> getEventById(String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        eventOpt.ifPresent(event -> {
            List<EventPresenter> presenters = presenterRepository.findByEventId(event.getId());
            List<EventOrganizer> organizers = organizerRepository.findByEventId(event.getId());
            List<EventParticipant> participants = participantRepository.findByEventId(event.getId());

            event.setPresenters(presenters);
            event.setOrganizers(organizers);
            event.setParticipants(participants);

            enrichEventWithRegistrationCount(event);
        });
        return eventOpt;
    }

    private void enrichEventWithRegistrationCount(Event event) {
        long count = eventRepository.countRegistrationsByEventId(event.getId());
        event.setRegisteredCount((int) count);
    }

    private double calculateScore(Event event, LocalDateTime now) {
        double score = Math.log(event.getRegisteredCount() + 1) * 10;

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
        LocalDateTime start = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return eventRepository.findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
                accountId, start, start.plusMonths(1));
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

        Event savedEvent = eventRepository.save(event);

        if (event.getTargetObjects() != null && !event.getTargetObjects().isEmpty()) {
            savedEvent.setTargetObjects(event.getTargetObjects());
            savedEvent = eventRepository.save(savedEvent);
        }

        if (event.getRecipients() != null && !event.getRecipients().isEmpty()) {
            savedEvent.setRecipients(event.getRecipients());
            savedEvent = eventRepository.save(savedEvent);
        }

        return savedEvent;
    }

    @Transactional
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
        return eventRepository.findById(id).map(existing -> {
            existing.setTitle(eventDetails.getTitle());
            existing.setDescription(eventDetails.getDescription());
            existing.setEventTopic(eventDetails.getEventTopic());
            existing.setCoverImage(eventDetails.getCoverImage());
            existing.setLocation(eventDetails.getLocation());
            existing.setEventMode(eventDetails.getEventMode());
            existing.setMaxParticipants(eventDetails.getMaxParticipants());
            existing.setStartTime(eventDetails.getStartTime());
            existing.setEndTime(eventDetails.getEndTime());
            existing.setRegistrationDeadline(eventDetails.getRegistrationDeadline());
            existing.setStatus(eventDetails.getStatus());
            existing.setFinalized(eventDetails.isFinalized());
            existing.setArchived(eventDetails.isArchived());
            existing.setApprovedByAccountId(eventDetails.getApprovedByAccountId());
            existing.setOrganizerUnit(eventDetails.getOrganizerUnit());
            existing.setNotes(eventDetails.getNotes());
            existing.setAdditionalInfo(eventDetails.getAdditionalInfo());
            existing.setCustomFieldsJson(eventDetails.getCustomFieldsJson());

            if (eventDetails.getTargetObjects() != null) {
                existing.setTargetObjects(eventDetails.getTargetObjects());
            }

            if (eventDetails.getRecipients() != null) {
                existing.setRecipients(eventDetails.getRecipients());
            }

            existing.setUpdatedAt(LocalDateTime.now());
            return eventRepository.save(existing);
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
        List<EventStatus> statuses = List.of(
                EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED, EventStatus.CANCELLED);
        return eventRepository.findByStatusInAndIsDeletedFalse(statuses);
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
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
                Collections.singletonList(status), accountId);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Transactional
    @Override
    public Event createPlan(Event event) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty())
            throw new IllegalArgumentException("Tiêu đề không được trống");
        if (event.getCreatedByAccountId() == null)
            throw new IllegalArgumentException("Thiếu người tạo");

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

        // ===== LƯU EVENT TRƯỚC =====
        Event savedEvent = eventRepository.save(event);

        // ===== THÊM LOG VÀ LƯU CÁC BẢNG CON =====
        log.info("========== CREATE PLAN DEBUG ==========");
        log.info("Saved event ID: {}", savedEvent.getId());

        // Lưu presenters
        if (event.getPresenters() != null && !event.getPresenters().isEmpty()) {
            for (EventPresenter presenter : event.getPresenters()) {
                log.info("Before set - Presenter event is null? {}", presenter.getEvent() == null);
                presenter.setEvent(savedEvent);
                log.info("After set - Presenter event ID: {}", presenter.getEvent().getId());
                presenter.setAssignedAt(LocalDateTime.now());
                presenterRepository.save(presenter);
            }
            log.info("Đã lưu {} presenters", event.getPresenters().size());
        }

        // Lưu organizers
        if (event.getOrganizers() != null && !event.getOrganizers().isEmpty()) {
            for (EventOrganizer organizer : event.getOrganizers()) {
                log.info("Before set - Organizer event is null? {}", organizer.getEvent() == null);
                organizer.setEvent(savedEvent);
                log.info("After set - Organizer event ID: {}", organizer.getEvent().getId());
                organizer.setAssignedAt(LocalDateTime.now());
                organizerRepository.save(organizer);
            }
            log.info("Đã lưu {} organizers", event.getOrganizers().size());
        }

        // Lưu participants
        if (event.getParticipants() != null && !event.getParticipants().isEmpty()) {
            for (EventParticipant participant : event.getParticipants()) {
                log.info("Before set - Participant event is null? {}", participant.getEvent() == null);
                participant.setEvent(savedEvent);
                log.info("After set - Participant event ID: {}", participant.getEvent().getId());
                participant.setRegisteredAt(LocalDateTime.now());
                participant.setStatus(ParticipationStatus.REGISTERED);
                participantRepository.save(participant);
            }
            log.info("Đã lưu {} participants", event.getParticipants().size());
        }

        // Lưu targetObjects và recipients (JSON fields)
        if (event.getTargetObjects() != null && !event.getTargetObjects().isEmpty()) {
            savedEvent.setTargetObjects(event.getTargetObjects());
            savedEvent = eventRepository.save(savedEvent);
        }

        if (event.getRecipients() != null && !event.getRecipients().isEmpty()) {
            savedEvent.setRecipients(event.getRecipients());
            savedEvent = eventRepository.save(savedEvent);
        }

        log.info("=======================================");

        return savedEvent;
    }

    @Transactional
    @Override
    public Event updatePlan(String id, Event planDetails) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch với ID: " + id));

        if (existing.getStatus() == EventStatus.PLAN_PENDING_APPROVAL
                || existing.getStatus() == EventStatus.PLAN_APPROVED) {
            throw new RuntimeException("Kế hoạch đã gửi duyệt hoặc đã duyệt, không thể sửa");
        }

        existing.setTitle(planDetails.getTitle());
        existing.setDescription(planDetails.getDescription());
        existing.setStartTime(planDetails.getStartTime());
        existing.setEndTime(planDetails.getEndTime());
        existing.setLocation(planDetails.getLocation());

        if (planDetails.getTargetObjects() != null) {
            existing.setTargetObjects(planDetails.getTargetObjects());
        }

        if (planDetails.getRecipients() != null) {
            existing.setRecipients(planDetails.getRecipients());
        }

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
        if (plan.getStatus() != EventStatus.DRAFT)
            throw new RuntimeException("Chỉ có thể gửi duyệt bản DRAFT");
        plan.setStatus(EventStatus.PLAN_PENDING_APPROVAL);
        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event approvePlan(String id, String approverId) {
        Event plan = eventRepository.findById(id).orElseThrow();
        if (plan.getStatus() != EventStatus.PLAN_PENDING_APPROVAL)
            throw new RuntimeException("Kế hoạch không ở trạng thái chờ duyệt");
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
        if (plan.getStatus() != EventStatus.PLAN_APPROVED)
            throw new RuntimeException("Kế hoạch chưa được duyệt");

        Event newEvent = new Event();
        newEvent.setTitle(Optional.ofNullable(eventDetails.getTitle()).orElse(plan.getTitle()));
        newEvent.setDescription(Optional.ofNullable(eventDetails.getDescription()).orElse(plan.getDescription()));
        newEvent.setStartTime(Optional.ofNullable(eventDetails.getStartTime()).orElse(plan.getStartTime()));
        newEvent.setEndTime(Optional.ofNullable(eventDetails.getEndTime()).orElse(plan.getEndTime()));
        newEvent.setLocation(Optional.ofNullable(eventDetails.getLocation()).orElse(plan.getLocation()));
        newEvent.setMaxParticipants(eventDetails.getMaxParticipants() > 0
                ? eventDetails.getMaxParticipants() : plan.getMaxParticipants());
        newEvent.setOrganizerUnit(plan.getOrganizerUnit());
        newEvent.setCreatedByAccountId(eventDetails.getCreatedByAccountId());
        newEvent.setStatus(EventStatus.EVENT_PENDING_APPROVAL);
        newEvent.setCreatedAt(LocalDateTime.now());

        if (plan.getTargetObjects() != null) {
            newEvent.setTargetObjects(plan.getTargetObjects());
        }

        if (plan.getRecipients() != null) {
            newEvent.setRecipients(plan.getRecipients());
        }

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

    @Override
    @Transactional
    public Event rejectEvent(String id, String approverId, String reason) {
        throw new UnsupportedOperationException("Chức năng từ chối sự kiện chưa được triển khai");
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

    private boolean isPlanStatus(EventStatus status) {
        return status == EventStatus.DRAFT
                || status == EventStatus.PLAN_PENDING_APPROVAL
                || status == EventStatus.PLAN_APPROVED;
    }

    @Override
    public List<PlanResponseDto> getAllPlansEnriched() {
        List<EventStatus> statuses = List.of(
                EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED, EventStatus.CANCELLED);

        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(statuses);
        if (plans.isEmpty()) return Collections.emptyList();

        Set<String> userIds = plans.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = Collections.emptyMap();
        try {
            if (!userIds.isEmpty()) {
                userMap = identityClient.getUsersByIds(new ArrayList<>(userIds)).stream()
                        .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi Identity Service", e);
        }

        Map<String, UserDto> finalUserMap = userMap;
        return plans.stream()
                .map(e -> PlanResponseDto.from(e,
                        finalUserMap.get(e.getCreatedByAccountId()),
                        finalUserMap.get(e.getApprovedByAccountId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansByAccountId(String accountId) {
        List<EventStatus> statuses = List.of(
                EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED, EventStatus.CANCELLED);

        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(statuses, accountId);

        for (Event plan : plans) {
            List<EventPresenter> presenters = presenterRepository.findByEventId(plan.getId());
            plan.setPresenters(presenters);

            List<EventOrganizer> organizers = organizerRepository.findByEventId(plan.getId());
            plan.setOrganizers(organizers);

            List<EventParticipant> participants = participantRepository.findByEventId(plan.getId());
            plan.setParticipants(participants);

            enrichEventWithRegistrationCount(plan);

            log.info("Plan {} - presenters: {}, organizers: {}, participants: {}, targetObjects: {}",
                    plan.getId(), presenters.size(), organizers.size(), participants.size(), plan.getTargetObjects());
        }

        Set<String> userIds = plans.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = Collections.emptyMap();
        try {
            if (!userIds.isEmpty()) {
                userMap = identityClient.getUsersByIds(new ArrayList<>(userIds)).stream()
                        .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi Identity Service", e);
        }

        Map<String, UserDto> finalUserMap = userMap;
        return plans.stream()
                .map(e -> PlanResponseDto.from(e,
                        finalUserMap.get(e.getCreatedByAccountId()),
                        finalUserMap.get(e.getApprovedByAccountId())))
                .collect(Collectors.toList());
    }


    @Override
    public List<PlanResponseDto> getEventsByAccountId(String accountId) {
        List<EventStatus> statuses = List.of(
                EventStatus.EVENT_PENDING_APPROVAL, EventStatus.PUBLISHED,
                EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.CANCELLED);

        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(statuses, accountId);

        for (Event event : events) {
            List<EventPresenter> presenters = presenterRepository.findByEventId(event.getId());
            event.setPresenters(presenters);

            List<EventOrganizer> organizers = organizerRepository.findByEventId(event.getId());
            event.setOrganizers(organizers);

            List<EventParticipant> participants = participantRepository.findByEventId(event.getId());
            event.setParticipants(participants);

            enrichEventWithRegistrationCount(event);
        }

        Set<String> userIds = events.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = Collections.emptyMap();
        try {
            if (!userIds.isEmpty()) {
                userMap = identityClient.getUsersByIds(new ArrayList<>(userIds)).stream()
                        .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi Identity Service", e);
        }

        Map<String, UserDto> finalUserMap = userMap;
        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(e -> PlanResponseDto.from(e,
                        finalUserMap.get(e.getCreatedByAccountId()),
                        finalUserMap.get(e.getApprovedByAccountId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByStatus(EventStatus status) {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));
        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(e -> PlanResponseDto.from(e, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansPendingApproval() {
        return eventRepository.findByStatusInAndIsDeletedFalse(
                        Collections.singletonList(EventStatus.PLAN_PENDING_APPROVAL))
                .stream()
                .map(e -> PlanResponseDto.from(e, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsPendingApproval() {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(
                Collections.singletonList(EventStatus.EVENT_PENDING_APPROVAL));
        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .map(e -> PlanResponseDto.from(e, null, null))
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public Event updateEventStatus(String id, EventStatus status, String approverId, String accountId) {
        return switch (status) {
            case PLAN_PENDING_APPROVAL -> submitPlanForApproval(id);
            case PLAN_APPROVED -> approvePlan(id, approverId);
            case PUBLISHED -> approveEvent(id, approverId);
            case ONGOING -> startEvent(id);
            case COMPLETED -> completeEvent(id);
            case CANCELLED -> cancelEvent(id, null);
            default -> throw new RuntimeException("Trạng thái không hỗ trợ: " + status);
        };
    }
}