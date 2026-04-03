package src.main.eventservice.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import src.main.eventservice.client.IdentityServiceClient;
import src.main.eventservice.constant.RedisConstant;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.dto.UserDto;
import src.main.eventservice.entity.*;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.entity.enums.OrganizerRole;
import src.main.eventservice.entity.enums.ParticipationStatus;
import src.main.eventservice.entity.enums.RecapStatus;
import src.main.eventservice.repository.*;
import src.main.eventservice.service.EventService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
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
    private final EventRegistrationRepository registrationRepository;
    private final EventInvitationRepository invitationRepository;

    private final StringRedisTemplate redisTemplate;

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    // Lấy tất cả sự kiện đang hoạt động (không bao gồm kế hoạch và sự kiện đã xóa) - dùng cho người dùng cuối
    @Override
    public List<Event> findAllActive() {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(
                List.of(EventStatus.EVENT_PENDING_APPROVAL, EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED));
        return events;
    }

    // Lấy tất cả sự kiện (bao gồm cả kế hoạch và sự kiện đã xóa) - dùng cho admin
    @Override
    public List<Event> findAll() {
        return eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(
                List.of(EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL, EventStatus.PLAN_APPROVED,
                        EventStatus.EVENT_PENDING_APPROVAL, EventStatus.PUBLISHED, EventStatus.ONGOING,
                        EventStatus.COMPLETED, EventStatus.CANCELLED));
    }

    // Lấy sự kiện nổi bật nhất dựa trên số lượng người đăng ký, đánh giá, bài viết liên quan, thời gian diễn ra, v.v. - dùng cho trang chủ
    @Override
    public List<Event> getFeaturedEvents() {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(
                List.of(EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED));
        LocalDateTime now = LocalDateTime.now();

        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparingDouble(e -> -calculateScore(e, now)))
                .limit(6)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết sự kiện theo ID, bao gồm cả thông tin đã xóa (nếu có) - dùng cho admin
    @Override
    public Optional<Event> findById(String id) {
        Optional<Event> events = eventRepository.findById(id);
        events.ifPresent(this::enrichEventWithRegistrationCount);
        return events;
    }

    // Lấy chi tiết sự kiện theo ID, chỉ khi sự kiện chưa bị xóa - dùng cho người dùng cuối
    @Override
    @Transactional
    public Optional<Event> getEventById(String id) {
        return eventRepository.findByIdAndIsDeletedFalse(id)
                .map(event -> {
                    enrichEventWithRegistrationCount(event);
                    return event;
                });
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

    // Lấy tất cả kế hoạch của tôi dựa trên accountId - dùng cho trang cá nhân
    @Override
    public List<Event> getEventsByAccountId(String accountId) {
        List<EventStatus> statuses = List.of(
                EventStatus.EVENT_PENDING_APPROVAL, EventStatus.PUBLISHED,
                EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.CANCELLED);

        // 1. Lấy toàn bộ Events cùng với các list liên quan (đã dùng EntityGraph ở Repo)
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(statuses, accountId);

        if (events.isEmpty()) return Collections.emptyList();

        // Lấy số lượng người đăng ký cho mỗi event
        events.forEach(this::enrichEventWithRegistrationCount);

        // Thu thập ID người dùng để gọi Identity Service 1 lần duy nhất
        Set<String> userIds = events.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = fetchUserMap(userIds);

        // 3. Map thông tin User vào Entity
        events.forEach(event -> {
            event.setCreator(userMap.get(event.getCreatedByAccountId()));
            event.setApprover(userMap.get(event.getApprovedByAccountId()));
        });

        // 4. Sắp xếp và Map sang DTO
        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    // Lấy tất cả sự kiện của tôi trong tháng hiện tại dựa trên accountId - dùng cho trang cá nhân
    @Override
    public List<Event> getMyEventsByAccountAndMonth(String accountId) {
        // 1. Tính toán khoảng thời gian đầu tháng và cuối tháng
        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);

        // 2. Lấy danh sách events (đã kèm theo presenters, organizers, participants qua EntityGraph)
        List<Event> events = eventRepository.findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
                accountId, startOfMonth, endOfMonth);

        if (events.isEmpty()) return Collections.emptyList();

        // 3. Bổ sung số lượng người đăng ký cho mỗi event
        events.forEach(this::enrichEventWithRegistrationCount);

        // 4. Thu thập ID và gọi Identity Service để lấy thông tin User (Creator/Approver)
        Set<String> userIds = events.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = fetchUserMap(userIds);

        // 5. Gán thông tin User vào từng Entity Event (@Transient fields)
        events.forEach(event -> {
            event.setCreator(userMap.get(event.getCreatedByAccountId()));
            event.setApprover(userMap.get(event.getApprovedByAccountId()));
        });

        // 6. Sắp xếp theo thời gian tạo hoặc thời gian bắt đầu (mới nhất lên đầu)
        return events.stream()
                .sorted(Comparator.comparing(Event::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private Map<String, UserDto> fetchUserMap(Set<String> userIds) {
        if (userIds.isEmpty()) return Collections.emptyMap();
        try {
            return identityClient.getUsersByIds(new ArrayList<>(userIds)).stream()
                    .collect(Collectors.toMap(UserDto::getId, u -> u, (old, latest) -> old));
        } catch (Exception e) {
            log.error("Failed to fetch users from Identity Service", e);
            return Collections.emptyMap();
        }
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
    public List<Event> getEventsByStatuses(List<String> statuses) {
        List<EventStatus> eventStatuses = statuses.stream()
                .map(s -> {
                    try {
                        return EventStatus.valueOf(s);
                    } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Trạng thái không hợp lệ: " + s);
                    }
                })
                .collect(Collectors.toList());

        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(eventStatuses);
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
//        Optional<Event> plans = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
//                Collections.singletonList(status), accountId);
//        plans.forEach(this::enrichEventWithRegistrationCount);
//        return plans;
        return null;
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

        // ===== LƯU EVENT TRƯỚC =====
        Event savedEvent = eventRepository.save(event);



        // Lưu presenters
        if (event.getPresenters() != null && !event.getPresenters().isEmpty()) {
            for (EventPresenter presenter : event.getPresenters()) {
                presenter.setEvent(savedEvent);
                presenter.setAssignedAt(LocalDateTime.now());
                presenterRepository.save(presenter);
            }
        }

        // Lưu organizers
        if (event.getOrganizers() != null && !event.getOrganizers().isEmpty()) {
            for (EventOrganizer organizer : event.getOrganizers()) {
                organizer.setEvent(savedEvent);
                organizer.setAssignedAt(LocalDateTime.now());
                organizerRepository.save(organizer);
            }
        }

        // Lưu participants
        if (event.getParticipants() != null && !event.getParticipants().isEmpty()) {
            for (EventParticipant participant : event.getParticipants()) {
                participant.setEvent(savedEvent);
                participant.setStatus(ParticipationStatus.REGISTERED);
                participantRepository.save(participant);
            }
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
//        List<EventStatus> statuses = List.of(
//                EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL,
//                EventStatus.PLAN_APPROVED, EventStatus.CANCELLED);
//
//        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(statuses, accountId);
//
//        for (Event plan : plans) {
//            List<EventPresenter> presenters = presenterRepository.findByEventId(plan.getId());
//            plan.setPresenters(presenters);
//
//            List<EventOrganizer> organizers = organizerRepository.findByEventId(plan.getId());
//            plan.setOrganizers(organizers);
//
//            List<EventParticipant> participants = participantRepository.findByEventId(plan.getId());
//            plan.setParticipants(participants);
//
//            enrichEventWithRegistrationCount(plan);
//        }
//
//        Set<String> userIds = plans.stream()
//                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
//                .filter(Objects::nonNull)
//                .filter(id -> !id.isBlank())
//                .collect(Collectors.toSet());
//
//        Map<String, UserDto> userMap = Collections.emptyMap();
//        try {
//            if (!userIds.isEmpty()) {
//                userMap = identityClient.getUsersByIds(new ArrayList<>(userIds)).stream()
//                        .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
//            }
//        } catch (Exception e) {
//        }
//
//        Map<String, UserDto> finalUserMap = userMap;
//        return plans.stream()
//                .map(e -> PlanResponseDto.from(e,
//                        finalUserMap.get(e.getCreatedByAccountId()),
//                        finalUserMap.get(e.getApprovedByAccountId())))
//                .collect(Collectors.toList());
        return null;
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

    @Override
    public Map<String, String> invitateParticipants(String eventId, String organizerId, List<String> inviteeIds) {
        // 1. Kiểm tra sự tồn tại của sự kiện
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sự kiện không tồn tại"));

        // Kiểm tra trạng thái sự kiện
        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể mời tham gia khi sự kiện đang PUBLISHED hoặc ONGOING");
        }

        // 2. Kiểm tra organizerId có thuộc Ban tổ chức của eventId này không
        EventOrganizer eventOrganizer = organizerRepository.findByEventIdAndOrganizerAccountId(eventId, organizerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền mời người tham gia cho sự kiện này"));

        // 3. Xác thực danh sách người dùng mục tiêu từ Identity Service
        List<UserDto> targetUsers = identityClient.getUsersByIds(inviteeIds);

        long expirySeconds = RedisConstant.INVITE_EXPIRY_SECONDS;; // Dùng hằng số đã tạo
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(expirySeconds);

        String inviteToken = UUID.randomUUID().toString();

        // 4. Xử lý Stream để tạo danh sách EventInvitation
        List<EventInvitation> invitations = targetUsers.stream()
                .filter(user -> user.getEmail() != null)
                // Lọc: Không mời người đã có trong BTC
                .filter(user -> !organizerRepository.existsByEventIdAndAccountId(eventId, user.getId()))
                // Lọc: (Tùy chọn) Không mời người đang có lời mời PENDING cho event này
                // .filter(user -> !invitationRepository.existsByEventIdAndInviteeEmailAndStatus(eventId, user.getEmail(), InvitationStatus.PENDING))
                .map(user -> {

                    // Lưu token vào Redis để check nhanh khi Accept
                    String redisKey = RedisConstant.EVENT_INVITE_PREFIX + inviteToken;
                    redisTemplate.opsForValue().set(redisKey, user.getId(), expirySeconds, TimeUnit.SECONDS);

                    return EventInvitation.builder()
                            .event(event)
                            .inviterAccountId(organizerId) // Người mời
                            .inviteeAccountId(user.getId()) // ID người nhận
                            .inviteeEmail(user.getEmail())   // Email người nhận
                            // Chú ý: Bạn cần thêm trường fullName vào Entity EventInvitation nếu muốn lưu,
                            // hoặc dùng message để chứa thông tin này.
                            .message("Mời tham gia Ban tổ chức sự kiện: " + event.getTitle())
                            .targetRole(OrganizerRole.MEMBER) // Vai trò dự kiến
                            .status(RecapStatus.InvitationStatus.PENDING)
                            .expiredAt(expiryDate)
                            // .token(inviteToken) // Đảm bảo Entity có trường token nếu muốn lưu DB
                            .build();
                })
                .toList();

        if (invitations.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách mời trống hoặc người dùng đã có trong BTC");
        }

        // 5. Lưu vào bảng event_invitations (Sử dụng invitationRepository)
        invitationRepository.saveAll(invitations);

        // 6. Gửi Email thông báo (Async)
        invitations.forEach(invitation -> {

            String inviteUrl = String.format("http://localhost:8082/api/events/%s/accept-invite?token=%s",

                    eventId, inviteToken);

            sendEventInviteEmailAsync(invitation.getInviteeEmail(), inviteUrl, event.getTitle(), invitation.getMessage());
        });

        return Map.of(
                "status", "success",
                "invitedCount", String.valueOf(invitations.size()),
                "message", "Đã gửi lời mời thành công",
                "expiresIn", expirySeconds + "s"
        );
    }

    @Override
    @Transactional
    public Map<String, String> acceptInvite(String eventId, String token) {
        // 1. Tìm lời mời dựa trên token (Sử dụng invitationRepository)
        EventInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không hợp lệ hoặc không tồn tại"));

        // 2. Bảo mật: Kiểm tra xem lời mời này có thuộc về eventId đang gọi không
        if (!invitation.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã mời này không thuộc về sự kiện hiện tại");
        }

        // 3. Kiểm tra trạng thái lời mời (Dùng InvitationStatus của bạn)
        if (invitation.getStatus() == RecapStatus.InvitationStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.OK, "Bạn đã chấp nhận lời mời này trước đó rồi");
        }

        if (invitation.getStatus() != RecapStatus.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.GONE, "Lời mời này không còn khả dụng");
        }

        // 4. Kiểm tra hết hạn qua Redis
        String redisKey = RedisConstant.EVENT_INVITE_PREFIX + token;
        if (Boolean.FALSE.equals(redisTemplate.hasKey(redisKey))) {
            invitation.setStatus(RecapStatus.InvitationStatus.REJECTED);
            invitationRepository.save(invitation);
            throw new ResponseStatusException(HttpStatus.GONE, "Lời mời đã hết hạn (30 giây). Vui lòng liên hệ Trưởng ban để gửi lại.");
        }

        // --- MỚI: Lấy Name từ IdentityService dựa trên inviteeAccountId ---
        String fullName = "Thành viên BTC"; // Default
        try {
            // Giả sử identityClient có hàm lấy profile theo 1 ID
            UserDto userProfile = identityClient.getUsersById(invitation.getInviteeAccountId());
            if (userProfile != null && userProfile.getFullName() != null) {
                fullName = userProfile.getFullName();
            }
        } catch (Exception e) {
            log.warn("Không thể lấy profile mới nhất từ Identity Service cho ID: {}, sử dụng tên mặc định", invitation.getInviteeAccountId());
            // Nếu Identity chết, bạn có thể lấy lại fullName đã lưu trong Invitation (nếu lúc mời có lưu)
        }

        // 5. CHÍNH THỨC LƯU VÀO EVENT_ORGANIZERS
        EventOrganizer newOrganizer = EventOrganizer.builder()
                .event(invitation.getEvent())
                .accountId(invitation.getInviteeAccountId())
                .fullName(fullName) // Đảm bảo Entity Invitation có lưu fullName từ Identity
                .email(invitation.getInviteeEmail())
                .role(invitation.getTargetRole())   // Lấy Role được chỉ định lúc mời (LEADER, STAFF,...)
                .assignedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        organizerRepository.save(newOrganizer);

        // 6. Cập nhật trạng thái lời mời và dọn dẹp Redis
        invitation.setStatus(RecapStatus.InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        redisTemplate.delete(redisKey);

        // 7. Trả về kết quả
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Chúc mừng! Bạn đã chính thức trở thành thành viên Ban tổ chức.");
        response.put("role", newOrganizer.getRole().toString());
        response.put("eventName", invitation.getEvent().getTitle());

        return response;
    }

    @Async
    public void sendEventInviteEmailAsync(String targetEmail, String inviteUrl, String eventName, String fullName) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("eventName", eventName);
            context.setVariable("inviteUrl", inviteUrl);

            // Đảm bảo bạn có file src/main/resources/templates/email/event-invite.html
            String html = templateEngine.process("email/event-invite", context);

            helper.setTo(targetEmail);
            helper.setSubject("[IUH EVENT] Lời mời tham gia: " + eventName);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Lỗi gửi mail mời sự kiện: {}", e.getMessage());
        }
    }
}