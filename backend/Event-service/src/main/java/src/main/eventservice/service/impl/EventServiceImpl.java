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
import src.main.eventservice.entity.EventTemplate;
import src.main.eventservice.entity.enums.EventStatus;
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
                EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED,
                EventStatus.CANCELLED
        );
        return eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
    }

    @Override
    public List<Event> getPlansByStatus(EventStatus status) {
        if (!isPlanStatus(status)) {
            throw new IllegalArgumentException("Status không thuộc giai đoạn kế hoạch");
        }
        List<EventStatus> planStatuses = Collections.singletonList(status);
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Override
    public List<Event> getPlansByStatusById(EventStatus status, String accountId) {
        if (!isPlanStatus(status)) {
            throw new IllegalArgumentException("Status không thuộc giai đoạn kế hoạch");
        }
        List<EventStatus> planStatuses = Collections.singletonList(status);
        List<Event> plans = eventRepository
                .findByStatusInAndIsDeletedFalseAndCreatedByAccountId(planStatuses, accountId);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Transactional
    @Override
    public Event createPlan(Event event) {
        // Validate bắt buộc
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề kế hoạch không được để trống");
        }

        if (event.getCreatedByAccountId() == null || event.getCreatedByAccountId().trim().isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy thông tin người tạo kế hoạch");
        }

        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setArchived(false);
        event.setFinalized(false);
        event.setDeleted(false);

        if (event.getStatus() == null) {
            event.setStatus(EventStatus.DRAFT);
        }

        if (event.getTemplateId() != null && !event.getTemplateId().trim().isEmpty()) {
            EventTemplate template = eventTemplateRepository.findById(event.getTemplateId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy template"));
            template.setUsageCount(template.getUsageCount() + 1);
            eventTemplateRepository.save(template);
        }

        log.info("Tạo kế hoạch mới: {} bởi account: {}", event.getTitle(), event.getCreatedByAccountId());

        return eventRepository.save(event);
    }
    @Transactional
    @Override
    public Event updatePlan(String id, Event planDetails) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch"));

        if (existingEvent.getStatus() == EventStatus.PLAN_PENDING_APPROVAL ||
                existingEvent.getStatus() == EventStatus.PLAN_APPROVED) {
            throw new RuntimeException("Không thể sửa kế hoạch đã được gửi duyệt hoặc đã được duyệt");
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
    public Event submitPlanForApproval(String id) {
        Event plan = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch với ID: " + id));

        if (plan.getStatus() != EventStatus.DRAFT) {
            throw new RuntimeException("Chỉ có thể gửi duyệt kế hoạch ở trạng thái DRAFT");
        }

        plan.setStatus(EventStatus.PLAN_PENDING_APPROVAL);
        plan.setUpdatedAt(LocalDateTime.now());

        log.info("Kế hoạch {} đã được gửi duyệt, cần admin phê duyệt", plan.getTitle());
        // TODO: Gửi thông báo cho Admin

        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event approvePlan(String id, String approverId) {
        Event plan = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch với ID: " + id));

        if (plan.getStatus() != EventStatus.PLAN_PENDING_APPROVAL) {
            throw new RuntimeException("Kế hoạch không ở trạng thái chờ duyệt");
        }

        plan.setStatus(EventStatus.PLAN_APPROVED);
        plan.setApprovedByAccountId(approverId);
        plan.setUpdatedAt(LocalDateTime.now());

        log.info("Admin {} đã phê duyệt kế hoạch {}", approverId, plan.getTitle());
        // TODO: Gửi thông báo cho BTC

        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event rejectPlan(String id, String approverId, String reason) {
        Event plan = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch với ID: " + id));

        if (plan.getStatus() != EventStatus.PLAN_PENDING_APPROVAL) {
            throw new RuntimeException("Kế hoạch không ở trạng thái chờ duyệt");
        }

        plan.setStatus(EventStatus.CANCELLED);
        plan.setNotes(reason);
        plan.setUpdatedAt(LocalDateTime.now());

        log.info("Admin {} đã từ chối kế hoạch {} với lý do: {}", approverId, plan.getTitle(), reason);

        return eventRepository.save(plan);
    }

    @Transactional
    @Override
    public Event createEventFromPlan(String planId, Event eventDetails) {
        Event plan = eventRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch với ID: " + planId));

        if (plan.getStatus() != EventStatus.PLAN_APPROVED) {
            throw new RuntimeException("Chỉ có thể tạo sự kiện từ kế hoạch đã được duyệt");
        }

        Event newEvent = new Event();
        newEvent.setTitle(eventDetails.getTitle() != null ? eventDetails.getTitle() : plan.getTitle());
        newEvent.setDescription(eventDetails.getDescription() != null ? eventDetails.getDescription() : plan.getDescription());
        newEvent.setStartTime(eventDetails.getStartTime() != null ? eventDetails.getStartTime() : plan.getStartTime());
        newEvent.setEndTime(eventDetails.getEndTime() != null ? eventDetails.getEndTime() : plan.getEndTime());
        newEvent.setLocation(eventDetails.getLocation() != null ? eventDetails.getLocation() : plan.getLocation());
        newEvent.setMaxParticipants(eventDetails.getMaxParticipants() > 0 ? eventDetails.getMaxParticipants() : plan.getMaxParticipants());
        newEvent.setOrganizerUnit(plan.getOrganizerUnit());
        newEvent.setCreatedByAccountId(eventDetails.getCreatedByAccountId());
        newEvent.setCreatedAt(LocalDateTime.now());
        newEvent.setUpdatedAt(LocalDateTime.now());
        newEvent.setDeleted(false);
        newEvent.setArchived(false);
        newEvent.setStatus(EventStatus.EVENT_PENDING_APPROVAL);

        log.info("Sự kiện {} được tạo từ kế hoạch {} và đang chờ admin duyệt", newEvent.getTitle(), plan.getTitle());

        return eventRepository.save(newEvent);
    }

    @Transactional
    @Override
    public Event approveEvent(String id, String approverId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));

        if (event.getStatus() != EventStatus.EVENT_PENDING_APPROVAL) {
            throw new RuntimeException("Sự kiện không ở trạng thái chờ duyệt");
        }

        event.setStatus(EventStatus.PUBLISHED);
        event.setApprovedByAccountId(approverId);
        event.setUpdatedAt(LocalDateTime.now());

        log.info("Admin {} đã phê duyệt sự kiện {}", approverId, event.getTitle());

        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event rejectEvent(String id, String approverId, String reason) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));

        if (event.getStatus() != EventStatus.EVENT_PENDING_APPROVAL) {
            throw new RuntimeException("Sự kiện không ở trạng thái chờ duyệt");
        }

        event.setStatus(EventStatus.CANCELLED);
        event.setNotes(reason);
        event.setUpdatedAt(LocalDateTime.now());

        log.info("Admin {} đã từ chối sự kiện {} với lý do: {}", approverId, event.getTitle(), reason);

        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event startEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new RuntimeException("Chỉ có thể bắt đầu sự kiện ở trạng thái PUBLISHED");
        }

        event.setStatus(EventStatus.ONGOING);
        event.setUpdatedAt(LocalDateTime.now());

        log.info("Sự kiện {} đã bắt đầu", event.getTitle());

        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event completeEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));

        if (event.getStatus() != EventStatus.ONGOING) {
            throw new RuntimeException("Chỉ có thể kết thúc sự kiện ở trạng thái ONGOING");
        }

        event.setStatus(EventStatus.COMPLETED);
        event.setUpdatedAt(LocalDateTime.now());

        log.info("Sự kiện {} đã kết thúc", event.getTitle());

        return eventRepository.save(event);
    }

    @Transactional
    @Override
    public Event cancelEvent(String id, String reason) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện/kế hoạch với ID: " + id));

        EventStatus currentStatus = event.getStatus();

        if (currentStatus == EventStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy sự kiện đã kết thúc");
        }

        event.setStatus(EventStatus.CANCELLED);
        event.setApprovedByAccountId(null);
        event.setUpdatedAt(LocalDateTime.now());

        if (reason != null) {
            event.setNotes(reason);
        }

        log.info("Đã hủy {} với ID: {}, lý do: {}",
                isPlanStatus(currentStatus) ? "kế hoạch" : "sự kiện", id, reason);

        return eventRepository.save(event);
    }


    private void enrichEventWithRegistrationCount(Event event) {
        long count = eventRepository.countRegistrationsByEventId(event.getId());
        event.setRegisteredCount((int) count);
    }

    private boolean isPlanStatus(EventStatus status) {
        return status == EventStatus.DRAFT ||
                status == EventStatus.PLAN_PENDING_APPROVAL ||
                status == EventStatus.PLAN_APPROVED;
    }

    private boolean isEventStatus(EventStatus status) {
        return status == EventStatus.EVENT_PENDING_APPROVAL ||
                status == EventStatus.PUBLISHED ||
                status == EventStatus.ONGOING ||
                status == EventStatus.COMPLETED;
    }


    @Override
    public List<PlanResponseDto> getAllPlansEnriched() {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED,
                EventStatus.CANCELLED
        );

        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);

        if (plans.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> allUserIds = plans.stream()
                .flatMap(event -> Stream.of(event.getCreatedByAccountId(), event.getApprovedByAccountId()))
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
        Map<String, UserDto> userMap = new HashMap<>();
        try {
            if (!allUserIds.isEmpty()) {
                List<UserDto> userList = identityClient.getUsersByIds(new ArrayList<>(allUserIds));

                userMap = userList.stream()
                        .collect(Collectors.toMap(
                                UserDto::getId,
                                user -> user,
                                (existing, replacement) -> existing
                        ));
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi Identity Service: {}", e.getMessage());
        }

        final Map<String, UserDto> finalUserMap = userMap;

        return plans.stream()
                .map(event -> {
                    UserDto creator = finalUserMap.get(event.getCreatedByAccountId());
                    UserDto approver = finalUserMap.get(event.getApprovedByAccountId());
                    
                    return PlanResponseDto.from(event, creator, approver);
                })
                .collect(Collectors.toList());
    }
    @Override
    public List<PlanResponseDto> getPlansByAccountId(String accountId) {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED,
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
                EventStatus.EVENT_PENDING_APPROVAL,
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
        if (!isEventStatus(status) && status != EventStatus.CANCELLED) {
            throw new IllegalArgumentException("Status không thuộc giai đoạn sự kiện");
        }

        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));

        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansPendingApproval() {
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(
                Collections.singletonList(EventStatus.PLAN_PENDING_APPROVAL));

        return plans.stream()
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsPendingApproval() {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(
                Collections.singletonList(EventStatus.EVENT_PENDING_APPROVAL));

        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .map(event -> PlanResponseDto.from(event, null, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Event updateEventStatus(String id, EventStatus status, String approverId, String accountId) {
        switch (status) {
            case PLAN_PENDING_APPROVAL:
                return submitPlanForApproval(id);
            case PLAN_APPROVED:
                return approvePlan(id, approverId);
            case EVENT_PENDING_APPROVAL:
                throw new RuntimeException("Vui lòng sử dụng createEventFromPlan để tạo sự kiện từ kế hoạch");
            case PUBLISHED:
                return approveEvent(id, approverId);
            case ONGOING:
                return startEvent(id);
            case COMPLETED:
                return completeEvent(id);
            case CANCELLED:
                return cancelEvent(id, null);
            default:
                throw new RuntimeException("Không hỗ trợ chuyển trạng thái: " + status);
        }
    }
}