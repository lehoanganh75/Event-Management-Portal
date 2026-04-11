package com.eventservice.service.impl;

import com.eventservice.client.LuckyDrawClient;
import com.eventservice.dto.EventCurrentUserRole;
import com.eventservice.entity.*;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.InvitationStatus;
import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.entity.enums.ParticipationStatus;
import com.eventservice.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.eventservice.client.IdentityServiceClient;
import com.eventservice.constant.RedisConstant;
import com.eventservice.dto.NotificationEvent;
import com.eventservice.dto.PlanResponseDto;
import com.eventservice.dto.UserDto;
import com.eventservice.service.EmailService;
import com.eventservice.service.EventService;

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

    private final LuckyDrawClient luckyDrawClient;

    private final StringRedisTemplate redisTemplate;

    private final EmailService emailService;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Lấy sự kiện cho xem (trang chủ, trang danh sách sự kiện)
    @Override
    public List<Event> findEventsForUser() {
        List<EventStatus> publicStatuses = List.of(
                EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.CANCELLED
        );
        return enrichEvents(eventRepository.findByStatusInAndIsDeletedFalseOrderByRegistrationDeadlineAsc(publicStatuses));
    }

    // Lấy sự kiện đang diễn ra hôm nay
    @Override
    public List<Event> getOngoingEvents() {
        LocalDateTime now = LocalDateTime.now();

        List<EventStatus> statuses = List.of(EventStatus.PUBLISHED, EventStatus.ONGOING);

        List<Event> events = eventRepository.findOngoingEvents(statuses, now);

        return enrichEvents(events);
    }

    // Lấy sự kiện sắp diễn ra trong tuần này
    @Override
    public List<Event> getUpcomingEventsThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusDays(7);
        List<Event> events = eventRepository.findByStartTimeBetweenAndStatusAndIsDeletedFalse(
                now, nextWeek, EventStatus.PUBLISHED);
        return enrichEvents(events);
    }

    // Lấy sự kiện nổi bật nhất (Featured)
    @Override
    public List<Event> getFeaturedEvents() {
        LocalDateTime now = LocalDateTime.now();
        // Lấy ứng viên tiềm năng để tính điểm
        List<Event> candidates = eventRepository.findByStatusInAndIsDeletedFalse(
                List.of(EventStatus.PUBLISHED, EventStatus.ONGOING));

        List<Event> featured = candidates.stream()
                .peek(this::enrichEventWithRegistrationCount)
                .sorted(Comparator.comparingDouble((Event e) -> -calculateScore(e, now)))
                .limit(6)
                .collect(Collectors.toList());

        return enrichEvents(featured);
    }

    // Lấy sự kiện cho admin và super admin xem (trang quản lý sự kiện)
    @Override
    public List<Event> findEventsForAdmin() {
        return enrichEvents(eventRepository.findByIsDeletedFalseOrderByCreatedAtDesc());
    }

    @Override
    public List<Event> findMyEventsByRole(String accountId, String roleType) {
        Set<Event> combined = getRawEventsByRole(accountId, roleType);

        // Chuyển sang List để sắp xếp
        List<Event> result = new ArrayList<>(combined);

        // Sắp xếp: Mới nhất lên đầu (dựa trên startTime, nếu null thì dùng createdAt)
        result.sort((e1, e2) -> {
            LocalDateTime t1 = (e1.getStartTime() != null) ? e1.getStartTime() : e1.getCreatedAt();
            LocalDateTime t2 = (e2.getStartTime() != null) ? e2.getStartTime() : e2.getCreatedAt();
            return t2.compareTo(t1);
        });

        // Cuối cùng đi qua hàm enrich để lấy UserDto và RegistrationCount
        return enrichEvents(result);
    }

    @Override
    public List<Event> getMyEventsByAccountAndMonth(String accountId, String roleType, int month, int year) {
        // 1. Lấy dữ liệu thô dựa trên Role
        Set<Event> rawEvents = getRawEventsByRole(accountId, roleType);

        // 2. Lọc theo Tháng và Năm (Dựa trên startTime)
        List<Event> filtered = rawEvents.stream()
                .filter(e -> e.getStartTime() != null
                        && e.getStartTime().getMonthValue() == month
                        && e.getStartTime().getYear() == year)
                .collect(Collectors.toList());

        // 3. Sắp xếp (Dùng chung logic sắp xếp của bạn)
        filtered.sort((e1, e2) -> {
            LocalDateTime t1 = e1.getStartTime(); // Ở đây chắc chắn startTime != null do đã filter
            LocalDateTime t2 = e2.getStartTime();
            return t2.compareTo(t1);
        });

        // 4. Làm giàu dữ liệu (UserDto, Count...)
        return enrichEvents(filtered);
    }

    @Override
    public Optional<Event> getEventById(String id, String accountId) {
        Event event = eventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện với ID: " + id));

        List<Event> enrichedList = enrichEvents(List.of(event));

        if (enrichedList.isEmpty()) {
            return Optional.empty();
        }

        Event enrichedEvent = enrichedList.get(0);

        enrichEventForCurrentUser(enrichedEvent, accountId);

        return Optional.of(enrichedEvent);
    }

    // --- CÁC HÀM HELPER (CLEAN CODE) ---

    private List<Event> enrichEvents(List<Event> events) {
        if (events.isEmpty()) return events;

        // 1. Gom tất cả ID (Creator, Approver, Organizers, Presenters)
        Set<String> userIds = collectAllUserIds(events);

        // 2. Gọi Identity Service 1 lần duy nhất
        Map<String, UserDto> userMap = fetchUserMap(userIds);

        // 3. Phân phối dữ liệu vào từng Event
        events.forEach(event -> {
            this.enrichEventWithRegistrationCount(event);
            event.setCreator(userMap.get(event.getCreatedByAccountId()));
            event.setApprover(userMap.get(event.getApprovedByAccountId()));

            // Lọc danh sách BTC/Presenters chưa bị xóa và có thể gán UserDto vào nếu cần
            filterActiveSubLists(event);
        });
        return events;
    }

    private void enrichEventForCurrentUser(Event event, String accountId) {
        if (accountId == null) {
            event.setCurrentUserRole(new EventCurrentUserRole()); // tất cả false
            return;
        }

        EventCurrentUserRole role = new EventCurrentUserRole();

        // 1. Creator & Approver
        role.setCreator(event.getCreatedByAccountId() != null &&
                event.getCreatedByAccountId().equals(accountId));
        role.setApprover(event.getApprovedByAccountId() != null &&
                event.getApprovedByAccountId().equals(accountId));

        // 2. Registered + chi tiết registration
        EventRegistration registration = findRegistrationByUser(event, accountId);
        role.setRegistered(registration != null);
        role.setRegistration(registration);   // null nếu chưa đăng ký

        // 3. Presenter
        EventPresenter presenter = findPresenterByUser(event, accountId);
        role.setPresented(presenter != null);
        role.setPresenter(presenter);

        // 4. Organizer (nếu sau này có)
        boolean isOrganizer = event.getOrganizers() != null &&
                event.getOrganizers().stream()
                        .anyMatch(o -> !o.isDeleted() && accountId.equals(o.getAccountId()));
        role.setOrganizer(isOrganizer);

        // 5. Các permission tiện lợi (có thể mở rộng sau)
        role.setCanEditEvent(role.isCreator() || role.isOrganizer());
        role.setCanManageRegistrations(role.isCreator() || role.isOrganizer() || role.isApprover());
        role.setCanViewTicket(role.isRegistered() || role.getRegistration() == null);

        event.setCurrentUserRole(role);
    }

    private EventRegistration findRegistrationByUser(Event event, String userId) {
        if (event.getRegistrations() == null) return null;
        return event.getRegistrations().stream()
                .filter(r -> !r.isDeleted() && userId.equals(r.getParticipantAccountId()))
                .findFirst()
                .orElse(null);
    }

    private EventPresenter findPresenterByUser(Event event, String userId) {
        if (event.getPresenters() == null) return null;
        return event.getPresenters().stream()
                .filter(p -> !p.isDeleted() && userId.equals(p.getPresenterAccountId()))
                .findFirst()
                .orElse(null);
    }

    private Set<String> collectAllUserIds(Collection<Event> events) {
        Set<String> ids = new HashSet<>();
        events.forEach(e -> {
            if (e.getCreatedByAccountId() != null) ids.add(e.getCreatedByAccountId());
            if (e.getApprovedByAccountId() != null) ids.add(e.getApprovedByAccountId());
            if (e.getOrganizers() != null) {
                e.getOrganizers().stream().filter(o -> !o.isDeleted()).forEach(o -> ids.add(o.getAccountId()));
            }
        });
        return ids;
    }

    private Map<String, UserDto> fetchUserMap(Set<String> userIds) {
        if (userIds.isEmpty()) return Collections.emptyMap();
        try {
            return identityClient.getUsersByIds(new ArrayList<>(userIds)).stream()
                    .collect(Collectors.toMap(UserDto::getId, u -> u, (old, latest) -> old));
        } catch (Exception e) {
            log.error("Failed to fetch users: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private void enrichEventWithRegistrationCount(Event event) {
        event.setRegisteredCount((int) eventRepository.countRegistrationsByEventId(event.getId()));
    }

    private void filterActiveSubLists(Event event) {
        if (event.getOrganizers() != null) {
            event.setOrganizers(event.getOrganizers().stream()
                    .filter(o -> !o.isDeleted()).collect(Collectors.toSet()));
        }
    }

    private double calculateScore(Event event, LocalDateTime now) {
        double score = Math.log(event.getRegisteredCount() + 1) * 10;
        if (event.getStartTime() != null && event.getStartTime().isBefore(now.plusDays(3))) score += 20;
        return score;
    }

    private Set<Event> getRawEventsByRole(String accountId, String roleType) {
        Set<Event> combined = new HashSet<>();
        String type = (roleType != null) ? roleType.toUpperCase() : "ALL";

        switch (type) {
            case "ORGANIZER":
                break;
            case "PRESENTER":
                combined.addAll(eventRepository.findEventsByPresenterAccountId(accountId));
                break;
            case "PARTICIPANT":
                combined.addAll(eventRepository.findEventsByParticipantAccountId(accountId));
                break;
            case "CREATOR":
                combined.addAll(eventRepository.findByCreatedByAccountIdAndIsDeletedFalse(accountId));
                break;
            case "APPROVER":
                combined.addAll(eventRepository.findByApprovedByAccountIdAndIsDeletedFalse(accountId));
                break;
            case "ALL":
            default:
                combined.addAll(eventRepository.findEventsByOrganizerAccountId(accountId));
                combined.addAll(eventRepository.findEventsByPresenterAccountId(accountId));
                combined.addAll(eventRepository.findEventsByParticipantAccountId(accountId));
                combined.addAll(eventRepository.findEventsByOrganizationOwner(accountId));
                combined.addAll(eventRepository.findByCreatedByAccountIdAndIsDeletedFalse(accountId));
                combined.addAll(eventRepository.findByApprovedByAccountIdAndIsDeletedFalse(accountId));
                break;
        }
        return combined;
    }

    @Transactional
    @Override
    public void deleteEvent(String id) {
        // 1. Kiểm tra tồn tại và lấy dữ liệu
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy sự kiện với ID: " + id));

        // 2. Thực hiện xóa mềm Event
        event.setDeleted(true);
        event.setStatus(EventStatus.CANCELLED);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);

        // 3. Xử lý logic xóa dịch vụ liên quan
        if (event.isHasLuckyDraw()) {
            try {
                // Nên truyền ID của sự kiện hoặc ID của vòng quay cụ thể
                luckyDrawClient.softDeleteByEventId(id);
            } catch (Exception e) {
                // Tùy chọn: Log lỗi hoặc ném ngoại lệ để Rollback event nếu cần tính đồng bộ cao
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi khi xóa vòng quay may mắn liên quan", e);
            }
        }
    }

    @Transactional
    @Override
    public void updateLuckyDrawId(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        if (event.isHasLuckyDraw()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sự kiện này đã có vòng quay may mắn rồi!");
        }

        event.setHasLuckyDraw(true);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }

    @Override
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

    @Transactional
    @Override
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

        // 2. Kiểm tra trạng thái sự kiện
        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể mời tham gia khi sự kiện đang PUBLISHED hoặc ONGOING");
        }

        // 3. Kiểm tra organizerId có thuộc Ban tổ chức của eventId này không
        organizerRepository.findByEventIdAndOrganizerAccountId(eventId, organizerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền mời người tham gia cho sự kiện này"));

        // 4. Xác thực danh sách người dùng mục tiêu từ Identity Service
        List<UserDto> targetUsers = identityClient.getUsersByIds(inviteeIds);

        long expirySeconds = RedisConstant.INVITE_EXPIRY_SECONDS;; // Dùng hằng số đã tạo
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(expirySeconds);

        String inviteToken = UUID.randomUUID().toString();

        // 5. Xử lý Stream để tạo danh sách EventInvitation
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
                            .inviteeEmail(user.getEmail()) // Email người nhận
                            .inviteeAccountId(user.getId())   // ID người nhận
                            .inviteeName(user.getFullName()) // Tên người nhận (nếu muốn lưu)
                            .inviteePosition("Giảng viên") // Vị trí công việc (nếu muốn lưu)
                            .message("Mời tham gia Ban tổ chức sự kiện: " + event.getTitle())
                            .targetRole(OrganizerRole.MEMBER) // Vai trò dự kiến
                            .status(InvitationStatus.PENDING)
                            .expiredAt(expiryDate)
                             .token(inviteToken)
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
            String inviteUrl = String.format("http://localhost:8082/events/%s/accept-invite?token=%s",
                    eventId, inviteToken);
            System.out.println("Email: " + invitation.getInviteeEmail() + ", URL: " + inviteUrl);
            emailService.sendEventInviteEmailAsync(invitation.getInviteeEmail(), inviteUrl, event.getTitle(), invitation.getMessage());

            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .recipientId(invitation.getInviteeAccountId())
                    .senderId(organizerId)
                    .title("Lời mời tham gia BTC")
                    .message("Bạn có lời mời mới cho sự kiện: " + event.getTitle())
                    .type("INVITATION")
                    .relatedEntityId(invitation.getId())
                    .actionUrl("/events/" + eventId + "/accept-invite?token=" + invitation.getToken())
                    .build();

            // Gửi vào topic "notification-topic"
            kafkaTemplate.send("notification-topic", notificationEvent);
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
        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.OK, "Bạn đã chấp nhận lời mời này trước đó rồi");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.GONE, "Lời mời này không còn khả dụng");
        }

        // 4. Kiểm tra hết hạn qua Redis
        String redisKey = RedisConstant.EVENT_INVITE_PREFIX + token;
        if (Boolean.FALSE.equals(redisTemplate.hasKey(redisKey))) {
            invitation.setStatus(InvitationStatus.REJECTED);
            invitationRepository.save(invitation);
            throw new ResponseStatusException(HttpStatus.GONE, "Lời mời đã hết hạn (30 giây). Vui lòng liên hệ Trưởng ban để gửi lại.");
        }

        // 5. CHÍNH THỨC LƯU VÀO EVENT_ORGANIZERS
        EventOrganizer newOrganizer = EventOrganizer.builder()
                .event(invitation.getEvent())
                .accountId(invitation.getInviteeAccountId())
                .fullName(invitation.getInviteeName()) // Đảm bảo Entity Invitation có lưu fullName từ Identity
                .email(invitation.getInviteeEmail())
                .role(invitation.getTargetRole())   // Lấy Role được chỉ định lúc mời (LEADER, STAFF,...)
                .assignedAt(LocalDateTime.now())
                .position(invitation.getInviteePosition())
                .isDeleted(false)
                .build();

        organizerRepository.save(newOrganizer);

        // 6. Cập nhật trạng thái lời mời và dọn dẹp Redis
        invitation.setStatus(InvitationStatus.ACCEPTED);
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
}