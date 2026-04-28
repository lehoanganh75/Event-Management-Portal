package com.eventservice.service.impl;

import com.eventservice.client.LuckyDrawClient;
import com.eventservice.dto.EventCurrentUserRole;
import com.eventservice.entity.*;
import com.eventservice.entity.enums.*;
import com.eventservice.repository.*;
import com.eventservice.service.S3Service;
import org.hibernate.Hibernate;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import com.eventservice.client.IdentityServiceClient;
import com.eventservice.constant.RedisConstant;
import com.eventservice.dto.NotificationEvent;
import com.eventservice.kafka.NotificationProducer;
import com.eventservice.dto.PlanResponseDto;
import com.eventservice.dto.UserDto;
import com.eventservice.service.EmailService;
import com.eventservice.service.EventService;

import java.time.LocalDateTime;
import java.text.Normalizer;
import java.util.regex.Pattern;
import java.util.*;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final EventTemplateRepository eventTemplateRepository;
    private final IdentityServiceClient identityClient;
    private final EventPresenterRepository presenterRepository;
    private final EventOrganizerRepository organizerRepository;
    private final EventParticipantRepository participantRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventInvitationRepository invitationRepository;
    private final NotificationProducer notificationProducer;
    private final EventSessionRepository sessionRepository;
    private final OrganizationRepository organizationRepository;
    private final EventSummaryRepository eventSummaryRepository;

    private final LuckyDrawClient luckyDrawClient;

    private final StringRedisTemplate redisTemplate;

    private final EmailService emailService;
    private final S3Service s3Service;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Lấy sự kiện cho xem (trang chủ, trang danh sách sự kiện)
    @Override
    public List<Event> findEventsForUser() {
        List<EventStatus> publicStatuses = List.of(
                EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.CANCELLED);
        return enrichEvents(
                eventRepository.findByStatusInAndIsDeletedFalseOrderByRegistrationDeadlineAsc(publicStatuses), null);
    }

    // Lấy sự kiện đang diễn ra hôm nay
    @Override
    public List<Event> getOngoingEvents() {
        LocalDateTime now = LocalDateTime.now();

        List<EventStatus> statuses = List.of(EventStatus.PUBLISHED, EventStatus.ONGOING);

        List<Event> events = eventRepository.findOngoingEvents(statuses, now);

        return enrichEvents(events, null);
    }

    @Override
    public List<Event> getCompletedEvents() {
        List<Event> events = eventRepository.findByStatus(EventStatus.COMPLETED);
        return enrichEvents(events, null);
    }

    // Lấy sự kiện sắp diễn ra trong tuần này
    @Override
    public List<Event> getUpcomingEventsThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusDays(7);
        List<Event> events = eventRepository.findByStartTimeBetweenAndStatusAndIsDeletedFalse(
                now, nextWeek, EventStatus.PUBLISHED);
        return enrichEvents(events, null);
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

        return enrichEvents(featured, null);
    }

    // Lấy sự kiện cho admin và super admin xem (trang quản lý sự kiện)
    @Override
    public List<Event> findEventsForAdmin() {
        return enrichEvents(eventRepository.findByIsDeletedFalseOrderByCreatedAtDesc(), null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> findMyEventsByRole(String accountId, String roleType) {
        Set<Event> combined = getRawEventsByRole(accountId, roleType);

        // Convert to List for sorting
        List<Event> result = new ArrayList<>(combined);

        // Sorting: Newest first (startTime, or createdAt if startTime is null)
        result.sort((e1, e2) -> {
            LocalDateTime t1 = (e1.getStartTime() != null) ? e1.getStartTime() : e1.getCreatedAt();
            LocalDateTime t2 = (e2.getStartTime() != null) ? e2.getStartTime() : e2.getCreatedAt();
            if (t1 == null || t2 == null)
                return 0;
            return t2.compareTo(t1);
        });

        // Initialize collections and enrich
        for (Event event : result) {
            // Force initialize lazy collections to prevent LazyInitializationException
            Hibernate.initialize(event.getOrganization());
            Hibernate.initialize(event.getOrganizers());
            if (event.getTemplate() != null) {
                Hibernate.initialize(event.getTemplate());
            }
            Hibernate.initialize(event.getPresenters());
            Hibernate.initialize(event.getOrganizers());
            Hibernate.initialize(event.getParticipants());
            enrichEventWithRegistrationCount(event);
        }

        return enrichEvents(result, accountId);
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
        return enrichEvents(filtered, accountId);
    }

    @Override
    @Transactional
    public Event getEventById(String idOrSlug, String accountId) {
        log.info("Fetching event by ID or Slug: {} for account: {}", idOrSlug, accountId);
        try {
            Event event = eventRepository.findById(idOrSlug)
                    .or(() -> eventRepository.findBySlug(idOrSlug))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

            // Initialize ALL necessary lazy fields to prevent LazyInitializationException during JSON serialization
            Hibernate.initialize(event.getOrganization());
            if (event.getTemplate() != null) {
                Hibernate.initialize(event.getTemplate());
                if (event.getTemplate().getOrganization() != null) {
                    Hibernate.initialize(event.getTemplate().getOrganization());
                }
            }
            Hibernate.initialize(event.getOrganizers());
            Hibernate.initialize(event.getPresenters());
            Hibernate.initialize(event.getInvitations());
            Hibernate.initialize(event.getSessions());
            // Also initialize sessions' presenters as they might be needed for display
            if (event.getSessions() != null) {
                event.getSessions().forEach(s -> {
                    if (s.getPresenter() != null) Hibernate.initialize(s.getPresenter());
                });
            }

            // Use enrichEvents which handles batch enrichment logic
            List<Event> enrichedList = enrichEvents(List.of(event), accountId);
            Event enrichedEvent = enrichedList.get(0);

            log.info("Successfully fetched and enriched event: {}", idOrSlug);
            return enrichedEvent;
        } catch (Exception e) {
            log.error("CRITICAL ERROR in getEventById for ID {}: {}", idOrSlug, e.getMessage(), e);
            e.printStackTrace(); // Print full stack trace to console for deep debugging
            if (e instanceof ResponseStatusException) throw (ResponseStatusException) e;
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi server: " + e.getMessage());
        }
    }

    // --- CÁC HÀM HELPER (CLEAN CODE) ---

    private List<Event> enrichEvents(List<Event> events, String currentAccountId) {
        if (events.isEmpty())
            return events;

        // 1. Gom tất cả ID (Creator, Approver, Organizers, Presenters)
        Set<String> userIds = collectAllUserIds(events);

        // 2. Gọi Identity Service 1 lần duy nhất
        Map<String, UserDto> userMap = fetchUserMap(userIds);

        // 3. Phân phối dữ liệu vào từng Event
        events.forEach(event -> {
            this.enrichEventWithRegistrationCount(event);
            event.setCreator(userMap.get(event.getCreatedByAccountId()));
            event.setApprover(userMap.get(event.getApprovedByAccountId()));
            if (currentAccountId != null) {
                this.enrichEventForCurrentUser(event, currentAccountId);
            }
        });
        return events;
    }

    private void enrichEventForCurrentUser(Event event, String accountId) {
        if (accountId == null) {
            event.setCurrentUserRole(new EventCurrentUserRole()); // tất cả false
            return;
        }

        EventCurrentUserRole role = new EventCurrentUserRole();

        // 1. Organizer (Cần lấy role trước để dùng cho các quyền khác)
        if (event.getOrganizers() != null) {
            event.getOrganizers().stream()
                    .filter(o -> !o.isDeleted() && accountId.equals(o.getAccountId()))
                    .findFirst()
                    .ifPresent(o -> {
                        role.setOrganizer(true);
                        role.setOrganizerRole(o.getRole().name());
                    });
        }

        // 2. Creator & Approver & Edit Permission
        role.setCreator(event.getCreatedByAccountId() != null &&
                event.getCreatedByAccountId().equals(accountId));
        role.setApprover(event.getApprovedByAccountId() != null &&
                event.getApprovedByAccountId().equals(accountId));
        
        // LEADER được quyền edit
        role.setCanEditEvent(role.isCreator() || 
                role.isApprover() || 
                "LEADER".equals(role.getOrganizerRole()));

        // 3. Registered + chi tiết registration
        EventRegistration registration = registrationRepository.findFirstByEventIdAndParticipantAccountId(event.getId(), accountId).orElse(null);
        role.setRegistered(registration != null);
        role.setRegistration(registration);

        // 4. Presenter
        EventPresenter presenter = presenterRepository.findFirstByEventIdAndPresenterAccountId(event.getId(), accountId).orElse(null);
        role.setPresented(presenter != null);
        role.setPresenter(presenter);

        // 5. Các permission tiện lợi (đã được tinh chỉnh theo role)
        // LEADER hoặc chủ sở hữu mới được sửa event
        role.setCanEditEvent(role.isCreator() || role.isApprover() || "LEADER".equals(role.getOrganizerRole()));
        
        // COORDINATOR trở lên được quản lý registrations
        role.setCanManageRegistrations(role.isCreator() || role.isApprover() || 
                "LEADER".equals(role.getOrganizerRole()) || "COORDINATOR".equals(role.getOrganizerRole()));
        
        // COORDINATOR trở lên được quản lý team (thêm/xóa thành viên)
        role.setCanManageTeam(role.isCreator() || role.isApprover() || 
                "LEADER".equals(role.getOrganizerRole()) || "COORDINATOR".equals(role.getOrganizerRole()));

        // COORDINATOR trở lên được điểm danh (quét QR)
        role.setCanCheckIn(role.isCreator() || role.isApprover() || 
                "LEADER".equals(role.getOrganizerRole()) || "COORDINATOR".equals(role.getOrganizerRole()));
        
        role.setCanScanQR(role.isCanCheckIn());

        // ADVISOR trở lên hoặc Core Team được xem thống kê
        role.setCanViewAnalytics(role.isCreator() || role.isApprover() || 
                "LEADER".equals(role.getOrganizerRole()) || "ADVISOR".equals(role.getOrganizerRole()));

        // Core Team được quản lý Lucky Draw
        role.setCanManageLuckyDraw(role.isCreator() || role.isApprover() || 
                "LEADER".equals(role.getOrganizerRole()) || "COORDINATOR".equals(role.getOrganizerRole()));

        role.setCanViewTicket(role.isRegistered() || role.getRegistration() == null);

        event.setCurrentUserRole(role);
    }

    private Set<String> collectAllUserIds(Collection<Event> events) {
        Set<String> ids = new HashSet<>();
        events.forEach(e -> {
            if (e.getCreatedByAccountId() != null && !e.getCreatedByAccountId().isBlank())
                ids.add(e.getCreatedByAccountId());
            if (e.getApprovedByAccountId() != null && !e.getApprovedByAccountId().isBlank())
                ids.add(e.getApprovedByAccountId());
            if (e.getOrganizers() != null) {
                e.getOrganizers().stream()
                        .filter(o -> !o.isDeleted() && o.getAccountId() != null && !o.getAccountId().isBlank())
                        .forEach(o -> ids.add(o.getAccountId()));
            }
            if (e.getInvitations() != null) {
                e.getInvitations().stream()
                        .filter(inv -> inv.getInviteeAccountId() != null && !inv.getInviteeAccountId().isBlank())
                        .forEach(inv -> ids.add(inv.getInviteeAccountId()));
            }
        });
        return ids;
    }

    private Map<String, UserDto> fetchUserMap(Set<String> userIds) {
        if (userIds.isEmpty())
            return Collections.emptyMap();
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

    private double calculateScore(Event event, LocalDateTime now) {
        double score = Math.log(event.getRegisteredCount() + 1) * 10;
        if (event.getStartTime() != null && event.getStartTime().isBefore(now.plusDays(3)))
            score += 20;
        return score;
    }

    private Set<Event> getRawEventsByRole(String accountId, String roleType) {
        Set<Event> combined = new HashSet<>();
        String type = (roleType != null) ? roleType.toUpperCase() : "ALL";

        switch (type) {
            case "ORGANIZER":
                combined.addAll(eventRepository.findEventsByOrganizerAccountId(accountId));
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
        return combined.stream().filter(e -> !e.isDeleted()).collect(Collectors.toSet());
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
                // Tùy chọn: Log lỗi hoặc ném ngoại lệ để Rollback event nếu cần tính đồng bộ
                // cao
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi khi xóa vòng quay may mắn liên quan", e);
            }
        }
    }

    @Transactional
    @Override
    public void updateLuckyDrawId(String id, boolean hasLuckyDraw) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        // Nếu hasLuckyDraw = true thì mới check conflict (để tránh tạo 2 cái)
        if (hasLuckyDraw && event.isHasLuckyDraw()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sự kiện này đã có vòng quay may mắn rồi!");
        }

        event.setHasLuckyDraw(hasLuckyDraw);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }

    @Override
    @Transactional
    public Event createEvent(Event event, List<String> organizerIds, List<Map<String, Object>> presenterIds,
            List<Map<String, Object>> invitations,
            MultipartFile file) {
        // 0. Handle Image Upload if present
        if (file != null && !file.isEmpty()) {
            try {
                String imageUrl = s3Service.uploadFile(file);
                event.setCoverImage(imageUrl);
            } catch (Exception e) {
                log.error("Failed to upload event cover image to S3", e);
                // Optionally throw exception or just continue without image
            }
        }

        // 1. Validate
        if (event.getTitle() == null || event.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề không được để trống");
        }

        // 2. Organization
        if (event.getOrganization() == null || event.getOrganization().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sự kiện phải thuộc về một tổ chức");
        }

        Organization organization = organizationRepository.findById(event.getOrganization().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tổ chức không tồn tại"));

        event.setOrganization(organization);

        // 3. Slug + Status
        event.setSlug(generateSlug(event.getTitle()));
        if (event.getStatus() == null) {
            event.setStatus(EventStatus.DRAFT);
        }

        // Auto-approve if status is PUBLISHED and no approver set
        if (event.getStatus() == EventStatus.PUBLISHED && event.getApprovedByAccountId() == null) {
            event.setApprovedByAccountId(event.getCreatedByAccountId());
        }

        // 3.5 Link nested entities before saving
        Set<EventPresenter> pendingPresenters = new HashSet<>();
        if (event.getPresenters() != null) {
            pendingPresenters.addAll(event.getPresenters());
            event.getPresenters().clear(); // Tránh lưu cascade trực tiếp, dùng hệ thống invitation
        }

        if (event.getSessions() != null) {
            event.getSessions().forEach(s -> s.setEvent(event));
        }
        // Clear invitations from event object because they are handled separately in
        // step 9
        event.setInvitations(new HashSet<>());

        // 4. Save Event
        Event savedEvent = eventRepository.save(event);

        // 5. Create LEADER (DUY NHẤT)
        String creatorId = event.getCreatedByAccountId();
        String creatorName = "Người tạo sự kiện";
        String creatorEmail = null;
        try {
            UserDto creator = identityClient.getUsersById(creatorId);
            if (creator != null) {
                creatorName = creator.getFullName();
                creatorEmail = creator.getEmail();
            }
        } catch (Exception e) {
            log.warn("Could not fetch creator info for ID: {}", creatorId);
        }

        EventOrganizer leader = EventOrganizer.builder()
                .event(savedEvent)
                .accountId(creatorId)
                .fullName(creatorName)
                .email(creatorEmail)
                .role(OrganizerRole.LEADER)
                .organization(savedEvent.getOrganization())
                .isDeleted(false)
                .build();

        organizerRepository.save(leader);

        // 6. Process direct organizers if any
        if (organizerIds != null && !organizerIds.isEmpty()) {
            List<String> idsToFetch = organizerIds.stream()
                    .filter(id -> !id.equals(creatorId))
                    .collect(Collectors.toList());

            if (!idsToFetch.isEmpty()) {
                try {
                    List<UserDto> users = identityClient.getUsersByIds(idsToFetch);
                    if (users != null) {
                        for (UserDto user : users) {
                            EventOrganizer member = EventOrganizer.builder()
                                    .event(savedEvent)
                                    .accountId(user.getId())
                                    .fullName(user.getFullName())
                                    .email(user.getEmail())
                                    .role(OrganizerRole.MEMBER)
                                    .organization(savedEvent.getOrganization())
                                    .isDeleted(false)
                                    .build();
                            organizerRepository.save(member);
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to fetch batch organizers info", e);
                }
            }
        }

        // 6.5 Process direct presenters if any
        if (presenterIds != null && !presenterIds.isEmpty()) {
            List<String> idsToFetch = presenterIds.stream()
                    .map(m -> (String) m.get("accountId"))
                    .filter(id -> id != null)
                    .collect(Collectors.toList());

            if (!idsToFetch.isEmpty()) {
                try {
                    List<UserDto> users = identityClient.getUsersByIds(idsToFetch);
                    Map<String, UserDto> userMap = users != null ? users.stream()
                            .collect(Collectors.toMap(UserDto::getId, u -> u)) : new HashMap<>();

                    for (Map<String, Object> pMap : presenterIds) {
                        String accId = (String) pMap.get("accountId");
                        if (accId == null)
                            continue;

                        UserDto user = userMap.get(accId);
                        String name = user != null ? user.getFullName() : (String) pMap.get("fullName");
                        String email = user != null ? user.getEmail() : (String) pMap.get("email");
                        String bio = (String) pMap.get("presenterBio");
                        String session = (String) pMap.get("presenterSession");

                        EventInvitation inv = EventInvitation.builder()
                                .event(savedEvent)
                                .inviterAccountId(savedEvent.getCreatedByAccountId())
                                .inviteeEmail(email)
                                .inviteeName(name)
                                .inviteeAccountId(accId)
                                .presenterBio(bio)
                                .presenterSession(session)
                                .type(InvitationType.PRESENTER)
                                .status(InvitationStatus.PENDING)
                                .token(UUID.randomUUID().toString())
                                .expiredAt(LocalDateTime.now().plusDays(7))
                                .build();

                        invitationRepository.save(inv);

                        // Gửi email mời diễn giả
                        String inviteUrl = String.format("http://localhost:5173/invitation/accept?token=%s&eventId=%s",
                                inv.getToken(), savedEvent.getId());
                        try {
                            emailService.sendPresenterInviteEmailAsync(
                                    email,
                                    inviteUrl,
                                    savedEvent.getTitle(),
                                    name != null ? name : "Diễn giả",
                                    savedEvent.getStartTime() != null ? savedEvent.getStartTime().toString() : "N/A",
                                    session != null && !session.isBlank() ? session : "Chưa xác định");
                        } catch (Exception e) {
                            log.error("Failed to send presenter invite email for: {}", email, e);
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to fetch batch presenters info", e);
                }
            }
        }

        // 7. Presenters (with Invitations)
        if (!pendingPresenters.isEmpty()) {
            processPresenterInvitations(savedEvent, pendingPresenters);
        }

        // 9. Invitations (Bulk from Modernized UI)
        if (invitations != null && !invitations.isEmpty()) {
            processInvitations(savedEvent, invitations);
        }

        return savedEvent;
    }

    @Override
    public Map<String, String> inviteParticipants(String eventId, String organizerId,
            com.eventservice.dto.InvitationBatchRequest request) {
        // 1. Kiểm tra sự tồn tại của sự kiện
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sự kiện không tồn tại"));

        // 2. Kiểm tra trạng thái sự kiện
        if (event.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Sự kiện đã bị xóa");
        }

        // 3. Kiểm tra quyền mời
        organizerRepository.findByEventIdAndOrganizerAccountId(eventId, organizerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Bạn không có quyền mời người tham gia cho sự kiện này"));

        // 4. Xác thực danh sách người dùng
        List<UserDto> targetUsers = identityClient.getUsersByIds(request.getInviteeIds());

        long expirySeconds = RedisConstant.INVITE_EXPIRY_SECONDS;
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(expirySeconds);
        String inviteToken = UUID.randomUUID().toString();

        // 5. Tạo danh sách lời mời
        List<EventInvitation> invitations = targetUsers.stream()
                .filter(user -> user.getEmail() != null)
                .filter(user -> !organizerRepository.existsByEventIdAndAccountId(eventId, user.getId()))
                .map(user -> {
                    String redisKey = RedisConstant.EVENT_INVITE_PREFIX + inviteToken;
                    redisTemplate.opsForValue().set(redisKey, user.getId(), expirySeconds, TimeUnit.SECONDS);

                    String inviteMessage = request.getMessage();
                    if (inviteMessage == null || inviteMessage.isBlank()) {
                        inviteMessage = "Mời bạn tham gia Ban tổ chức sự kiện: " + event.getTitle();
                    }

                    return EventInvitation.builder()
                            .event(event)
                            .inviterAccountId(organizerId)
                            .inviteeEmail(user.getEmail())
                            .inviteeAccountId(user.getId())
                            .inviteeName(user.getFullName())
                            .message(inviteMessage)
                            .targetRole(request.getTargetRole() != null ? request.getTargetRole()
                                    : com.eventservice.entity.enums.OrganizerRole.MEMBER)
                            .status(com.eventservice.entity.enums.InvitationStatus.PENDING)
                            .expiredAt(expiryDate)
                            .token(inviteToken)
                            .build();
                })
                .toList();

        if (invitations.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Danh sách mời trống hoặc người dùng đã có trong BTC");
        }

        // 5. Lưu vào bảng event_invitations (Sử dụng invitationRepository)
        invitationRepository.saveAll(invitations);

        // 6. Gửi Email thông báo (Async)
        invitations.forEach(invitation -> {
            String inviteUrl = String.format("http://localhost:5173/invitation/accept?token=%s&eventId=%s",
                    invitation.getToken(), eventId);

            String startTimeStr = event.getStartTime() != null ? event.getStartTime().toString() : "Chưa xác định";
            String endTimeStr = event.getEndTime() != null ? event.getEndTime().toString() : "Chưa xác định";
            String location = event.getLocation() != null ? event.getLocation() : "Trực tuyến";
            String description = event.getDescription() != null ? event.getDescription() : "";

            emailService.sendEventInviteEmailAsync(
                    invitation.getInviteeEmail(),
                    inviteUrl,
                    event.getTitle(),
                    invitation.getInviteeName(),
                    startTimeStr,
                    endTimeStr,
                    location,
                    description);

            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .recipientId(invitation.getInviteeAccountId())
                    .senderId(organizerId)
                    .title("Lời mời tham gia BTC")
                    .message("Bạn có lời mời mới cho sự kiện: " + event.getTitle())
                    .type("INVITATION")
                    .relatedEntityId(invitation.getId())
                    .actionUrl("/events/" + eventId + "/accept-invite?token=" + invitation.getToken())
                    .build();

            // Gửi vào topic "notification-topic" qua NotificationProducer (Chuẩn mới)
            notificationProducer.sendNotification(notificationEvent);
        });

        return Map.of(
                "status", "success",
                "invitedCount", String.valueOf(invitations.size()),
                "message", "Đã gửi lời mời thành công",
                "expiresIn", expirySeconds + "s");
    }

    @Override
    @Transactional
    public Map<String, String> acceptInvite(String eventId, String token) {
        // 1. Tìm lời mời dựa trên token
        EventInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Lời mời không hợp lệ hoặc không tồn tại"));

        Event event = invitation.getEvent();

        // 2. Bảo mật: Kiểm tra xem lời mời này có thuộc về eventId đang gọi không
        if (!invitation.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã mời này không thuộc về sự kiện hiện tại");
        }

        // 3. Kiểm tra trạng thái lời mời
        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.OK, "Bạn đã chấp nhận lời mời này trước đó rồi");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.GONE, "Lời mời này không còn khả dụng");
        }

        // 4. Kiểm tra trùng lịch (QUY TẮC: Một người không thể tham gia 2 sự kiện trùng lịch nhau)
        String inviteeId = invitation.getInviteeAccountId();
        LocalDateTime startTime = event.getStartTime();
        LocalDateTime endTime = event.getEndTime();

        // 4.1 Kiểm tra với tư cách Ban tổ chức
        List<EventOrganizer> orgConflicts = organizerRepository.findConflictingOrganizers(
                inviteeId, startTime, endTime, eventId);
        if (!orgConflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bạn đang trong ban tổ chức sự kiện '" + orgConflicts.get(0).getEvent().getTitle() + "' trùng thời gian.");
        }

        // 4.2 Kiểm tra với tư cách Người thuyết trình
        List<EventPresenter> preConflicts = presenterRepository.findConflictingPresenters(
                inviteeId, startTime, endTime, eventId);
        if (!preConflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bạn đã là diễn giả cho sự kiện '" + preConflicts.get(0).getEvent().getTitle() + "' trùng thời gian.");
        }

        // 4.3 Kiểm tra với tư cách Người tham dự
        List<EventRegistration> regConflicts = registrationRepository.findConflictingRegistrations(
                inviteeId, startTime, endTime, eventId, RegistrationStatus.REGISTERED);
        if (!regConflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bạn đã đăng ký sự kiện '" + regConflicts.get(0).getEvent().getTitle() + "' trùng thời gian.");
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("eventName", invitation.getEvent().getTitle());

        // 5. PHÂN LOẠI XỬ LÝ THEO LOẠI LỜI MỜI
        if (invitation.getType() == InvitationType.PRESENTER) {
            // LƯU VÀO EVENT_PRESENTERS
            EventPresenter presenter = EventPresenter.builder()
                    .event(invitation.getEvent())
                    .presenterAccountId(invitation.getInviteeAccountId())
                    .fullName(invitation.getInviteeName())
                    .email(invitation.getInviteeEmail())
                    .bio(invitation.getPresenterBio())
                    .status(ParticipationStatus.CONFIRMED)
                    .assignedAt(LocalDateTime.now())
                    .build();

            presenterRepository.save(presenter);

            // Link to sessions if invitation has session info
            if (invitation.getPresenterSession() != null && !invitation.getPresenterSession().isBlank()) {
                linkPresenterToSessions(presenter, invitation.getPresenterSession());
            }

            response.put("message", "Xác nhận tham gia thuyết trình thành công!");
            response.put("type", "PRESENTER");

        } else {
            // LƯU VÀO EVENT_ORGANIZERS
            EventOrganizer newOrganizer = EventOrganizer.builder()
                    .event(invitation.getEvent())
                    .accountId(invitation.getInviteeAccountId())
                    .fullName(invitation.getInviteeName())
                    .email(invitation.getInviteeEmail())
                    .role(invitation.getTargetRole() != null ? invitation.getTargetRole() : OrganizerRole.MEMBER)
                    .assignedAt(LocalDateTime.now())
                    .organization(event.getOrganization())
                    .addedByAccountId(invitation.getInviterAccountId())
                    .isDeleted(false)
                    .build();

            // Liên kết ngược để đảm bảo tính nhất quán trong Transaction
            if (event.getOrganizers() == null) {
                event.setOrganizers(new HashSet<>());
            }
            event.getOrganizers().add(newOrganizer);

            organizerRepository.save(newOrganizer);
            eventRepository.save(event);

            response.put("message", "Chúc mừng! Bạn đã chính thức trở thành thành viên Ban tổ chức.");
            response.put("type", "ORGANIZER");
            response.put("role", newOrganizer.getRole().toString());
        }

        // 6. Cập nhật trạng thái lời mời
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // String redisKey = RedisConstant.EVENT_INVITE_PREFIX + token;
        // redisTemplate.delete(redisKey);

        return response;
    }

    @Override
    @Transactional
    public Map<String, String> rejectInvite(String eventId, String token, String reason) {
        EventInvitation invitation = invitationRepository.findByEventIdAndToken(eventId, token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không tồn tại"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời mời này đã được xử lý");
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        invitation.setRejectionReason(reason);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã từ chối lời mời thành công");
        return response;
    }

    private void linkPresenterToSessions(EventPresenter presenter, String sessionMatch) {
        Event event = presenter.getEvent();
        if (event.getSessions() == null || event.getSessions().isEmpty()) {
            log.info("Sự kiện {} không có phiên nào để gán diễn giả", event.getId());
            return;
        }

        log.info("Đang gán diễn giả {} vào các phiên khớp với: {}", presenter.getFullName(), sessionMatch);

        if ("ALL".equalsIgnoreCase(sessionMatch)) {
            event.getSessions().forEach(s -> {
                s.setPresenter(presenter);
                sessionRepository.save(s);
            });
            log.info("Đã gán diễn giả vào TẤT CẢ các phiên");
        } else {
            // Tìm session có tên khớp (tạm thời khớp theo title)
            event.getSessions().stream()
                    .filter(s -> s.getTitle() != null && s.getTitle().equalsIgnoreCase(sessionMatch))
                    .forEach(s -> {
                        s.setPresenter(presenter);
                        sessionRepository.save(s);
                        log.info("Đã gán diễn giả vào phiên: {}", s.getTitle());
                    });
        }
    }

    @Override
    public EventInvitation getInvitationByToken(String eventId, String token) {
        log.info("#### [INVITE] Fetching invitation details for token: {} and eventId: {}", token, eventId);
        
        EventInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không tồn tại"));

        if (!invitation.getEvent().getId().equals(eventId)) {
            log.error("#### [INVITE] Token {} belongs to event {}, but requested event was {}", 
                token, invitation.getEvent().getId(), eventId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời mời không thuộc sự kiện này");
        }

        // Đảm bảo load thông tin event (Eager loading qua JOIN FETCH đã xử lý, nhưng check lại cho chắc)
        if (invitation.getEvent().getTitle() == null) {
            log.warn("#### [INVITE] Event title is null, forcing re-fetch for event ID: {}", eventId);
            Event fullEvent = eventRepository.findById(eventId).orElse(null);
            invitation.setEvent(fullEvent);
        }

        // Load thông tin người mời
        if (invitation.getInviterAccountId() != null) {
            try {
                invitation.setInviter(identityClient.getUsersById(invitation.getInviterAccountId()));
                log.info("#### [INVITE] Enriched inviter: {}", invitation.getInviter().getFullName());
            } catch (Exception e) {
                log.warn("#### [INVITE] Failed to fetch inviter info for {}: {}", invitation.getInviterAccountId(), e.getMessage());
            }
        }

        return invitation;
    }

    private String generateSlug(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "event-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String nfdNormalizedString = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String base = pattern.matcher(nfdNormalizedString).replaceAll("")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (base.isEmpty())
            base = "event";

        return base + "-" + UUID.randomUUID().toString().substring(0, 8);
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

            // Update Sessions
            if (eventDetails.getSessions() != null) {
                existing.getSessions().clear();
                for (EventSession s : eventDetails.getSessions()) {
                    s.setEvent(existing);
                    existing.getSessions().add(s);
                }
            }

            // Update Presenters
            if (eventDetails.getPresenters() != null) {
                existing.getPresenters().clear();
                for (EventPresenter p : eventDetails.getPresenters()) {
                    p.setEvent(existing);
                    existing.getPresenters().add(p);
                }
            }

            existing.setUpdatedAt(LocalDateTime.now());
            return eventRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));
    }

    @Transactional
    @Override
    public List<Event> getEventsByStatuses(List<String> statuses, String accountId) {
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
        events.forEach(e -> {
            this.enrichEventWithRegistrationCount(e);
            this.enrichEventForCurrentUser(e, accountId);
        });
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
        if (!isPlanStatus(status))
            throw new IllegalArgumentException("Status không thuộc giai đoạn kế hoạch");
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Override
    public List<Event> getPlansByStatusById(EventStatus status, String accountId) {
        if (!isPlanStatus(status))
            throw new IllegalArgumentException("Status không thuộc giai đoạn kế hoạch");
        // Optional<Event> plans =
        // eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
        // Collections.singletonList(status), accountId);
        // plans.forEach(this::enrichEventWithRegistrationCount);
        // return plans;
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
        if (event.getStatus() == null)
            event.setStatus(EventStatus.DRAFT);

        // Generate Slug (Required by DB)
        if (event.getSlug() == null || event.getSlug().isEmpty()) {
            event.setSlug(generateSlug(event.getTitle()));
        }

        // Increment Template Usage Count if present
        if (event.getTemplate() != null) {
            EventTemplate template = event.getTemplate();
            template.setUsageCount(template.getUsageCount() + 1);
            eventTemplateRepository.save(template);
            log.info("Incremented usageCount for template: {}", template.getId());

            // Send real-time notification about usage
            if (event.getCreatedByAccountId() != null && !event.getCreatedByAccountId().equals("anonymous")) {
                NotificationEvent usageNotification = NotificationEvent.builder()
                        .recipientId(event.getCreatedByAccountId())
                        .title("Đã áp dụng bản mẫu")
                        .message("Bản mẫu \"" + template.getTemplateName() + "\" đã được ghi nhận thêm 1 lượt sử dụng!")
                        .type("GENERAL")
                        .relatedEntityId(template.getId())
                        .actionUrl("/lecturer/templates")
                        .build();
                notificationProducer.sendNotification(usageNotification);
            }
        }

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
        Event savedPlan = eventRepository.save(plan);

        // 1. Notify the submitter themselves (self notification)
        if (savedPlan.getCreatedByAccountId() != null) {
            NotificationEvent selfNotification = NotificationEvent.builder()
                    .recipientId(savedPlan.getCreatedByAccountId())
                    .title("Gửi phê duyệt thành công")
                    .message("Kế hoạch \"" + savedPlan.getTitle() + "\" đã được gửi tới Super Admin.")
                    .type("SYSTEM") // Or appropriate type
                    .relatedEntityId(savedPlan.getId())
                    .actionUrl("/lecturer/events") // Or appropriate link
                    .build();
            notificationProducer.sendNotification(selfNotification);
        }

        // 2. Notify Super Admins
        try {
            List<String> superAdminIds = identityClient.getSuperAdminAccountIds();
            log.info("#### [EVENT SERVICE] Notifying {} super admins about new plan submission: {}", superAdminIds.size(),
                    savedPlan.getId());
            for (String adminId : superAdminIds) {
                NotificationEvent notification = NotificationEvent.builder()
                        .recipientId(adminId)
                        .title("Kế hoạch mới cần phê duyệt")
                        .message("Giảng viên vừa gửi một kế hoạch mới cần phê duyệt: \"" + savedPlan.getTitle() + "\"")
                        .type("PLAN_SUBMITTED")
                        .relatedEntityId(savedPlan.getId())
                        .actionUrl("/admin/plans")
                        .build();
                notificationProducer.sendNotification(notification);
            }
        } catch (Exception e) {
            log.error("#### [EVENT SERVICE] Failed to notify super admins about plan submission: {}", e.getMessage());
        }

        return savedPlan;
    }

    @Transactional
    @Override
    public Event approvePlan(String id, String approverId) {
        Event plan = eventRepository.findById(id).orElseThrow();
        if (plan.getStatus() != EventStatus.PLAN_PENDING_APPROVAL)
            throw new RuntimeException("Kế hoạch không ở trạng thái chờ duyệt");
        plan.setStatus(EventStatus.PLAN_APPROVED);
        plan.setApprovedByAccountId(approverId);
        Event savedPlan = eventRepository.save(plan);

        // 1. Thông báo cho người tạo kế hoạch (Giảng viên)
        if (savedPlan.getCreatedByAccountId() != null) {
            log.info("#### [EVENT SERVICE] Triggering notification for approved plan: {} to creator: {}",
                    savedPlan.getId(), savedPlan.getCreatedByAccountId());
            NotificationEvent creatorNotification = NotificationEvent.builder()
                    .recipientId(savedPlan.getCreatedByAccountId())
                    .title("Kế hoạch đã được duyệt")
                    .message("Kế hoạch \"" + savedPlan.getTitle() + "\" của bạn đã được Super Admin duyệt.")
                    .type("PLAN_APPROVED")
                    .relatedEntityId(savedPlan.getId())
                    .actionUrl("/lecturer/events")
                    .build();
            notificationProducer.sendNotification(creatorNotification);
        }

        // 2. Notify Super Admins
        try {
            List<String> superAdminIds = identityClient.getSuperAdminAccountIds();
            log.info("#### [EVENT SERVICE] Notifying {} super admins about plan approval: {}", superAdminIds.size(),
                    savedPlan.getId());
            for (String adminId : superAdminIds) {
                if (adminId.equals(approverId)) continue;
                NotificationEvent adminNotification = NotificationEvent.builder()
                        .recipientId(adminId)
                        .title("Kế hoạch đã được phê duyệt")
                        .message("Kế hoạch \"" + savedPlan.getTitle() + "\" đã được phê duyệt thành công.")
                        .type("PLAN_APPROVED")
                        .relatedEntityId(savedPlan.getId())
                        .actionUrl("/admin/plans")
                        .build();
                notificationProducer.sendNotification(adminNotification);
            }
        } catch (Exception e) {
            log.error("#### [EVENT SERVICE] Failed to notify super admins about plan approval: {}", e.getMessage());
        }

        return savedPlan;
    }

    @Transactional
    @Override
    public Event rejectPlan(String id, String approverId, String reason) {
        Event plan = eventRepository.findById(id).orElseThrow();
        plan.setStatus(EventStatus.REJECTED);
        plan.setNotes(reason);
        Event savedPlan = eventRepository.save(plan);

        // 1. Thông báo cho người tạo kế hoạch (Giảng viên)
        if (savedPlan.getCreatedByAccountId() != null) {
            log.info("#### [EVENT SERVICE] Triggering notification for rejected plan: {} to creator: {}",
                    savedPlan.getId(), savedPlan.getCreatedByAccountId());
            NotificationEvent creatorNotification = NotificationEvent.builder()
                    .recipientId(savedPlan.getCreatedByAccountId())
                    .title("Kế hoạch bị từ chối")
                    .message("Kế hoạch \"" + savedPlan.getTitle() + "\" của bạn đã bị từ chối. Lý do: "
                            + (reason != null ? reason : "Không có lý do cụ thể."))
                    .type("PLAN_REJECTED")
                    .relatedEntityId(savedPlan.getId())
                    .actionUrl("/lecturer/events")
                    .build();
            notificationProducer.sendNotification(creatorNotification);
        }

        // 2. Notify Super Admins
        try {
            List<String> superAdminIds = identityClient.getSuperAdminAccountIds();
            log.info("#### [EVENT SERVICE] Notifying {} super admins about plan rejection: {}", superAdminIds.size(),
                    savedPlan.getId());
            for (String adminId : superAdminIds) {
                if (adminId.equals(approverId)) continue;
                NotificationEvent adminNotification = NotificationEvent.builder()
                        .recipientId(adminId)
                        .title("Kế hoạch đã bị từ chối")
                        .message("Kế hoạch \"" + savedPlan.getTitle() + "\" đã bị từ chối.")
                        .type("PLAN_REJECTED")
                        .relatedEntityId(savedPlan.getId())
                        .actionUrl("/admin/plans")
                        .build();
                notificationProducer.sendNotification(adminNotification);
            }
        } catch (Exception e) {
            log.error("#### [EVENT SERVICE] Failed to notify super admins about plan rejection: {}", e.getMessage());
        }

        return savedPlan;
    }

    @Transactional
    @Override
    public Event createEventFromPlan(String planId, Event eventDetails) {
        Event plan = eventRepository.findById(planId).orElseThrow();
        if (plan.getStatus() != EventStatus.PLAN_APPROVED)
            throw new RuntimeException("Kế hoạch chưa được duyệt hoặc đã được chuyển đổi");

        Event newEvent = new Event();
        newEvent.setTitle(Optional.ofNullable(eventDetails.getTitle()).orElse(plan.getTitle()));
        newEvent.setDescription(Optional.ofNullable(eventDetails.getDescription()).orElse(plan.getDescription()));
        newEvent.setStartTime(Optional.ofNullable(eventDetails.getStartTime()).orElse(plan.getStartTime()));
        newEvent.setEndTime(Optional.ofNullable(eventDetails.getEndTime()).orElse(plan.getEndTime()));
        newEvent.setLocation(Optional.ofNullable(eventDetails.getLocation()).orElse(plan.getLocation()));
        newEvent.setMaxParticipants(eventDetails.getMaxParticipants() > 0
                ? eventDetails.getMaxParticipants()
                : plan.getMaxParticipants());
        newEvent.setCreatedByAccountId(eventDetails.getCreatedByAccountId());
        newEvent.setStatus(EventStatus.EVENT_PENDING_APPROVAL);
        newEvent.setSlug(generateSlug(newEvent.getTitle()));
        newEvent.setCreatedAt(LocalDateTime.now());
        newEvent.setOrganization(plan.getOrganization());
        newEvent.setTemplate(plan.getTemplate());
        newEvent.setCustomFieldsJson(plan.getCustomFieldsJson());
        newEvent.setEventTopic(plan.getEventTopic());
        newEvent.setType(plan.getType());

        if (plan.getTargetObjects() != null) {
            newEvent.setTargetObjects(new ArrayList<>(plan.getTargetObjects()));
        }

        if (plan.getRecipients() != null) {
            newEvent.setRecipients(new ArrayList<>(plan.getRecipients()));
        }

        Event savedEvent = eventRepository.save(newEvent);

        // Copy Presenters & Organizers from Plan if they exist
        List<EventPresenter> presenters = presenterRepository.findByEventId(plan.getId());
        for (EventPresenter p : presenters) {
            EventPresenter newP = p.copy(); // Assuming a copy method exists, or just create new
            newP.setEvent(savedEvent);
            presenterRepository.save(newP);
        }

        List<EventOrganizer> organizers = organizerRepository.findByEventId(plan.getId());
        for (EventOrganizer o : organizers) {
            EventOrganizer newO = o.copy();
            newO.setEvent(savedEvent);
            organizerRepository.save(newO);
        }

        // Hide old plan by changing status
        plan.setStatus(EventStatus.CONVERTED);
        eventRepository.save(plan);

        // 1. Notify the submitter themselves (self notification)
        if (savedEvent.getCreatedByAccountId() != null) {
            NotificationEvent selfNotification = NotificationEvent.builder()
                    .recipientId(savedEvent.getCreatedByAccountId())
                    .title("Gửi phê duyệt thành công")
                    .message("Sự kiện \"" + savedEvent.getTitle() + "\" đã được gửi tới Super Admin.")
                    .type("SYSTEM")
                    .relatedEntityId(savedEvent.getId())
                    .actionUrl("/lecturer/events")
                    .build();
            notificationProducer.sendNotification(selfNotification);
        }

        // 2. Notify Super Admins
        try {
            List<String> superAdminIds = identityClient.getSuperAdminAccountIds();
            log.info("#### [EVENT SERVICE] Notifying {} super admins about new event submission: {}", superAdminIds.size(),
                    savedEvent.getId());
            for (String adminId : superAdminIds) {
                NotificationEvent notification = NotificationEvent.builder()
                        .recipientId(adminId)
                        .title("Sự kiện mới cần phê duyệt")
                        .message("Giảng viên vừa tạo một sự kiện mới cần phê duyệt: \"" + savedEvent.getTitle() + "\"")
                        .type("EVENT_SUBMITTED")
                        .relatedEntityId(savedEvent.getId())
                        .actionUrl("/admin/events")
                        .build();
                notificationProducer.sendNotification(notification);
            }
        } catch (Exception e) {
            log.error("#### [EVENT SERVICE] Failed to notify super admins about event submission: {}", e.getMessage());
        }

        return savedEvent;
    }

    @Transactional
    @Override
    public Event approveEvent(String id, String approverId) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.PUBLISHED);
        event.setApprovedByAccountId(approverId);
        Event savedEvent = eventRepository.save(event);

        // 1. Thông báo cho người tạo sự kiện (Giảng viên)
        if (savedEvent.getCreatedByAccountId() != null) {
            log.info("#### [EVENT SERVICE] Triggering notification for approved event: {} to creator: {}",
                    savedEvent.getId(), savedEvent.getCreatedByAccountId());
            NotificationEvent creatorNotification = NotificationEvent.builder()
                    .recipientId(savedEvent.getCreatedByAccountId())
                    .title("Sự kiện đã được duyệt")
                    .message("Sự kiện \"" + savedEvent.getTitle() + "\" của bạn đã được công bố chính thức.")
                    .type("EVENT_CREATED")
                    .relatedEntityId(savedEvent.getId())
                    .actionUrl("/lecturer/events")
                    .build();
            notificationProducer.sendNotification(creatorNotification);
        }

        // 2. Notify Super Admins
        try {
            List<String> superAdminIds = identityClient.getSuperAdminAccountIds();
            log.info("#### [EVENT SERVICE] Notifying {} super admins about event approval: {}", superAdminIds.size(),
                    savedEvent.getId());
            for (String adminId : superAdminIds) {
                if (adminId.equals(approverId)) continue;
                NotificationEvent adminNotification = NotificationEvent.builder()
                        .recipientId(adminId)
                        .title("Sự kiện đã được công bố")
                        .message("Sự kiện \"" + savedEvent.getTitle() + "\" đã được phê duyệt và công bố thành công.")
                        .type("EVENT_CREATED")
                        .relatedEntityId(savedEvent.getId())
                        .actionUrl("/admin/events")
                        .build();
                notificationProducer.sendNotification(adminNotification);
            }
        } catch (Exception e) {
            log.error("#### [EVENT SERVICE] Failed to notify super admins about event approval: {}", e.getMessage());
        }

        return savedEvent;
    }

    @Override
    @Transactional
    public Event rejectEvent(String id, String approverId, String reason) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.REJECTED);
        event.setNotes(reason);
        Event savedEvent = eventRepository.save(event);

        // 1. Thông báo cho người tạo sự kiện (Giảng viên)
        if (savedEvent.getCreatedByAccountId() != null) {
            log.info("#### [EVENT SERVICE] Triggering notification for rejected event: {} to creator: {}",
                    savedEvent.getId(), savedEvent.getCreatedByAccountId());
            NotificationEvent creatorNotification = NotificationEvent.builder()
                    .recipientId(savedEvent.getCreatedByAccountId())
                    .title("Sự kiện bị từ chối")
                    .message("Sự kiện \"" + savedEvent.getTitle() + "\" của bạn đã bị Super Admin từ chối. Lý do: "
                            + (reason != null ? reason : "Không có lý do cụ thể."))
                    .type("PLAN_REJECTED")
                    .relatedEntityId(savedEvent.getId())
                    .actionUrl("/lecturer/events")
                    .build();
            notificationProducer.sendNotification(creatorNotification);
        }

        // 2. Notify Super Admins
        try {
            List<String> superAdminIds = identityClient.getSuperAdminAccountIds();
            log.info("#### [EVENT SERVICE] Notifying {} super admins about event rejection: {}", superAdminIds.size(),
                    savedEvent.getId());
            for (String adminId : superAdminIds) {
                NotificationEvent adminNotification = NotificationEvent.builder()
                        .recipientId(adminId)
                        .title("Sự kiện đã bị từ chối")
                        .message("Sự kiện \"" + savedEvent.getTitle() + "\" đã bị từ chối.")
                        .type("PLAN_REJECTED")
                        .relatedEntityId(savedEvent.getId())
                        .actionUrl("/admin/events")
                        .build();
                notificationProducer.sendNotification(adminNotification);
            }
        } catch (Exception e) {
            log.error("#### [EVENT SERVICE] Failed to notify super admins about event rejection: {}", e.getMessage());
        }

        return savedEvent;
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
        Event savedEvent = eventRepository.save(event);

        // Generate EventSummary snapshot
        if (eventSummaryRepository.findByEventId(id).isEmpty()) {
            List<EventRegistration> registrations = registrationRepository.findByEventId(id);
            int totalRegistered = registrations.size();
            int totalCheckedIn = (int) registrations.stream().filter(EventRegistration::isCheckedIn).count();
            double attendanceRate = totalRegistered > 0 ? (double) totalCheckedIn / totalRegistered * 100 : 0.0;

            // Generate Detailed Analysis
            Map<String, Object> analysis = new HashMap<>();
            
            // 1. Registration Timeline (By Date)
            Map<String, Long> timeline = registrations.stream()
                .filter(r -> r.getRegisteredAt() != null)
                .collect(Collectors.groupingBy(
                    r -> r.getRegisteredAt().toLocalDate().toString(),
                    TreeMap::new,
                    Collectors.counting()
                ));
            analysis.put("registrationTimeline", timeline);

            // 2. Check-in Distribution (By Hour)
            Map<Integer, Long> checkInHours = registrations.stream()
                .filter(r -> r.isCheckedIn() && r.getCheckInTime() != null)
                .collect(Collectors.groupingBy(
                    r -> r.getCheckInTime().getHour(),
                    TreeMap::new,
                    Collectors.counting()
                ));
            analysis.put("checkInTimeline", checkInHours);

            // 3. Status Distribution
            Map<RegistrationStatus, Long> statusDist = registrations.stream()
                .collect(Collectors.groupingBy(EventRegistration::getStatus, Collectors.counting()));
            analysis.put("statusDistribution", statusDist);

            EventSummary summary = EventSummary.builder()
                    .event(savedEvent)
                    .totalRegistered(totalRegistered)
                    .totalCheckedIn(totalCheckedIn)
                    .attendanceRate(attendanceRate)
                    .detailedAnalysis(analysis)
                    .luckyDrawWinners(new HashMap<>())
                    .feedbackStats(new HashMap<>())
                    .build();
            eventSummaryRepository.save(summary);
        }

        return savedEvent;
    }

    @Override
    public com.eventservice.dto.EventSummaryDto getEventSummary(String id) {
        EventSummary summary = eventSummaryRepository.findByEventId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo cho sự kiện này"));
        return com.eventservice.dto.EventSummaryDto.builder()
                .id(summary.getId())
                .eventId(summary.getEvent().getId())
                .totalRegistered(summary.getTotalRegistered())
                .totalCheckedIn(summary.getTotalCheckedIn())
                .attendanceRate(summary.getAttendanceRate())
                .luckyDrawWinners(summary.getLuckyDrawWinners())
                .feedbackStats(summary.getFeedbackStats())
                .detailedAnalysis(summary.getDetailedAnalysis())
                .createdAt(summary.getCreatedAt())
                .build();
    }

    @Transactional
    @Override
    public Event cancelEvent(String id, String reason) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus(EventStatus.CANCELLED);
        if (reason != null)
            event.setNotes(reason);
        Event savedEvent = eventRepository.save(event);

        // 3. Xử lý logic xóa dịch vụ liên quan (Vòng quay may mắn)
        if (savedEvent.isHasLuckyDraw()) {
            try {
                luckyDrawClient.softDeleteByEventId(id);
            } catch (Exception e) {
                log.warn("Lỗi khi hủy vòng quay may mắn liên quan (không ảnh hưởng đến việc hủy sự kiện): {}",
                        e.getMessage());
            }
        }

        // Send Notification
        if (savedEvent.getCreatedByAccountId() != null) {
            log.info("#### [EVENT SERVICE] Triggering notification for cancelled event: {} to recipient: {}",
                    savedEvent.getId(), savedEvent.getCreatedByAccountId());
            NotificationEvent notification = NotificationEvent.builder()
                    .recipientId(savedEvent.getCreatedByAccountId())
                    .title("Sự kiện đã bị hủy")
                    .message("Sự kiện \"" + savedEvent.getTitle() + "\" đã bị hủy. Lý do: "
                            + (reason != null ? reason : "Không có lý do cụ thể."))
                    .type("PLAN_REJECTED") // Use Rejected icon/color
                    .relatedEntityId(savedEvent.getId())
                    .actionUrl("/lecturer/events")
                    .build();
            notificationProducer.sendNotification(notification);
        }

        return savedEvent;
    }

    private boolean isPlanStatus(EventStatus status) {
        return status == EventStatus.DRAFT
                || status == EventStatus.PLAN_PENDING_APPROVAL
                || status == EventStatus.PLAN_APPROVED;
    }

    @Override
    public List<PlanResponseDto> getAllPlansEnriched() {
        List<EventStatus> statuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED,
                EventStatus.REJECTED);

        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(statuses);

        Map<String, List<EventPresenter>> presentersMap = new HashMap<>();
        Map<String, List<EventOrganizer>> organizersMap = new HashMap<>();
        Map<String, List<EventParticipant>> participantsMap = new HashMap<>();

        for (Event plan : plans) {
            presentersMap.put(plan.getId(), presenterRepository.findByEventId(plan.getId()));
            organizersMap.put(plan.getId(), organizerRepository.findByEventId(plan.getId()));
            participantsMap.put(plan.getId(), participantRepository.findByEventId(plan.getId()));
            enrichEventWithRegistrationCount(plan);
        }

        Set<String> userIds = plans.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = Collections.emptyMap();
        try {
            if (!userIds.isEmpty()) {
                List<UserDto> users = identityClient.getUsersByIds(new ArrayList<>(userIds));
                if (users != null) {
                    userMap = users.stream()
                            .filter(Objects::nonNull)
                            .filter(u -> u.getId() != null)
                            .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch users: {}", e.getMessage());
        }

        Map<String, UserDto> finalUserMap = userMap;
        return plans.stream()
                .map(e -> PlanResponseDto.from(e,
                        finalUserMap.get(e.getCreatedByAccountId()),
                        finalUserMap.get(e.getApprovedByAccountId()),
                        presentersMap.get(e.getId()),
                        organizersMap.get(e.getId()),
                        participantsMap.get(e.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getPlansByAccountId(String accountId) {
        List<EventStatus> statuses = List.of(
                EventStatus.DRAFT, EventStatus.PLAN_PENDING_APPROVAL,
                EventStatus.PLAN_APPROVED);

        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalseAndCreatedByAccountId(statuses, accountId);

        // Prepare maps for enriched data
        Map<String, List<EventPresenter>> presentersMap = new HashMap<>();
        Map<String, List<EventOrganizer>> organizersMap = new HashMap<>();
        Map<String, List<EventParticipant>> participantsMap = new HashMap<>();

        for (Event plan : plans) {
            presentersMap.put(plan.getId(), presenterRepository.findByEventId(plan.getId()));
            organizersMap.put(plan.getId(), organizerRepository.findByEventId(plan.getId()));
            participantsMap.put(plan.getId(), participantRepository.findByEventId(plan.getId()));
            enrichEventWithRegistrationCount(plan);
        }

        Set<String> userIds = plans.stream()
                .flatMap(e -> Stream.of(e.getCreatedByAccountId(), e.getApprovedByAccountId()))
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .collect(Collectors.toSet());

        Map<String, UserDto> userMap = Collections.emptyMap();
        try {
            if (!userIds.isEmpty()) {
                List<UserDto> users = identityClient.getUsersByIds(new ArrayList<>(userIds));
                if (users != null) {
                    userMap = users.stream()
                            .filter(Objects::nonNull)
                            .filter(u -> u.getId() != null)
                            .collect(Collectors.toMap(UserDto::getId, u -> u, (o, n) -> o));
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch users: {}", e.getMessage());
        }

        Map<String, UserDto> finalUserMap = userMap;
        return plans.stream()
                .map(e -> PlanResponseDto.from(e,
                        finalUserMap.get(e.getCreatedByAccountId()),
                        finalUserMap.get(e.getApprovedByAccountId()),
                        presentersMap.get(e.getId()),
                        organizersMap.get(e.getId()),
                        participantsMap.get(e.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByStatus(EventStatus status) {
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Collections.singletonList(status));
        events.forEach(this::enrichEventWithRegistrationCount);

        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
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

    @Override
    public List<Event> findEventsByOrganization(String orgId) {
        return eventRepository.findByOrganizationIdAndIsDeletedFalse(orgId);
    }

    @Override
    public List<Event> findEventsByOrganizationOwner(String ownerId) {
        return eventRepository.findEventsByOrganizationOwner(ownerId);
    }

    @Override
    public Map<String, Long> getQuickStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEvents", eventRepository.countByIsDeletedFalse());
        stats.put("publishedEvents", eventRepository.countByStatusAndIsDeletedFalse(EventStatus.PUBLISHED));
        stats.put("pendingPlans", eventRepository.countByStatusAndIsDeletedFalse(EventStatus.PLAN_PENDING_APPROVAL));
        stats.put("totalOrganizations", organizationRepository.countByIsDeletedFalse());
        return stats;
    }

    @Override
    @Transactional
    public Event updateEventStatus(String id, EventStatus status, String approverId, String accountId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        event.setStatus(status);
        if (status == EventStatus.PUBLISHED || status == EventStatus.PLAN_APPROVED) {
            event.setApprovedByAccountId(approverId);
        }
        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        // Send notification
        NotificationEvent notification = NotificationEvent.builder()
                .recipientId(event.getCreatedByAccountId())
                .title("Trạng thái sự kiện đã thay đổi")
                .message("Sự kiện \"" + event.getTitle() + "\" đã được cập nhật trạng thái thành: " + status)
                .type("SYSTEM")
                .relatedEntityId(event.getId())
                .actionUrl("/lecturer/events")
                .build();
        notificationProducer.sendNotification(notification);

        return saved;
    }

    @Override
    public Map<String, Object> getLecturerStats(String accountId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCreated", eventRepository.countByCreatedByAccountIdAndIsDeletedFalse(accountId));
        stats.put("ongoing", eventRepository.countByCreatedByAccountIdAndStatusAndIsDeletedFalse(accountId, EventStatus.ONGOING));
        stats.put("pending", eventRepository.countByCreatedByAccountIdAndStatusAndIsDeletedFalse(accountId, EventStatus.PLAN_PENDING_APPROVAL));
        
        // Lấy danh sách sự kiện gần nhất
        PageRequest limit = PageRequest.of(0, 5);
        stats.put("recentEvents", eventRepository.findByCreatedByAccountIdAndIsDeletedFalseOrderByCreatedAtDesc(accountId, limit).getContent());
        
        return stats;
    }

    @Override
    public void sendOrganizerInvitations(String eventId, List<Map<String, Object>> invitations) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        for (Map<String, Object> invMap : invitations) {
            String rawEmail = (String) invMap.get("inviteeEmail");
            if (rawEmail == null) continue;
            final String email = rawEmail.trim(); // Trim and make final for lambda use

            // Prevent duplicates: Check if already an organizer
            boolean alreadyOrganizer = (event.getOrganizers() != null) && event.getOrganizers().stream()
                    .anyMatch(o -> email.equalsIgnoreCase(o.getEmail()));
            if (alreadyOrganizer) continue;

            // Prevent duplicates: Check if already has a PENDING invitation
            Optional<EventInvitation> existing = invitationRepository.findByEventIdAndInviteeEmail(eventId, email);
            if (existing.isPresent() && existing.get().getStatus() == InvitationStatus.PENDING) {
                continue;
            }

            EventInvitation invitation = existing.orElse(new EventInvitation());
            invitation.setEvent(event);
            invitation.setInviterAccountId(event.getCreatedByAccountId());
            invitation.setInviteeEmail(email);
            invitation.setInviteeName((String) invMap.get("fullName"));
            
            // Try to get accountId from map or look it up by email
            String accountId = (String) invMap.get("inviteeAccountId");
            if (accountId == null || accountId.isBlank()) {
                log.info("inviteeAccountId missing for {}, attempting lookup by email", email);
                List<UserDto> users = identityClient.getUsersByEmails(List.of(email));
                if (!users.isEmpty()) {
                    UserDto userDto = users.get(0);
                    accountId = userDto.getId();
                    log.info("Found accountId {} for email {}", accountId, email);
                    
                    // Automatically enrich name if it's missing or looks like an ID/email
                    String currentName = invitation.getInviteeName();
                    if (currentName == null || currentName.isBlank() || currentName.equals(email) || currentName.matches("\\d+")) {
                        if (userDto.getFullName() != null && !userDto.getFullName().isBlank()) {
                            invitation.setInviteeName(userDto.getFullName());
                        }
                    }
                }
            }
            invitation.setInviteeAccountId(accountId);
            
            String roleStr = (String) invMap.getOrDefault("targetRole", invMap.get("role"));
            invitation.setTargetRole(OrganizerRole.valueOf(roleStr != null ? roleStr : "MEMBER"));
            invitation.setType(InvitationType.ORGANIZER);
            invitation.setStatus(InvitationStatus.PENDING);
            invitation.setToken(UUID.randomUUID().toString());
            invitation.setSentAt(LocalDateTime.now());
            invitation.setExpiredAt(LocalDateTime.now().plusDays(7));
            invitationRepository.save(invitation);

            // Send Email
            String inviteUrl = "http://localhost:5173/invitation/accept?eventId=" + eventId + "&token=" + invitation.getToken();
            emailService.sendEventInviteEmailAsync(
                    email, inviteUrl, event.getTitle(), invitation.getInviteeName(),
                    event.getStartTime().toString(), event.getEndTime().toString(),
                    event.getLocation(), event.getDescription()
            );

            // Send Web Notification
            try {
                if (invitation.getInviteeAccountId() != null && !invitation.getInviteeAccountId().isBlank()) {
                    log.info("#### [INVITE] Sending web notification to: {}", invitation.getInviteeAccountId());
                    NotificationEvent notification = NotificationEvent.builder()
                            .recipientId(invitation.getInviteeAccountId())
                            .title("Lời mời tham gia Ban tổ chức")
                            .message("Bạn được mời tham gia Ban tổ chức sự kiện: \"" + event.getTitle() + "\"")
                            .type("INVITATION")
                            .relatedEntityId(event.getId())
                            .actionUrl("/invitation/accept?eventId=" + eventId + "&token=" + invitation.getToken())
                            .build();
                    notificationProducer.sendNotification(notification);
                } else {
                    log.warn("#### [INVITE] Skip web notification: No accountId for {}", email);
                }
            } catch (Exception e) {
                log.error("#### [INVITE] Failed to send web notification: {}", e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void sendPresenterInvitations(String eventId, List<Map<String, Object>> invitations) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        for (Map<String, Object> invMap : invitations) {
            String rawEmail = (String) invMap.get("inviteeEmail");
            if (rawEmail == null) continue;
            final String email = rawEmail.trim(); // Trim and make final

            // Prevent duplicates: Check if already has a PENDING presenter invitation
            Optional<EventInvitation> existing = invitationRepository.findByEventIdAndInviteeEmail(eventId, email);
            if (existing.isPresent() && existing.get().getStatus() == InvitationStatus.PENDING && existing.get().getType() == InvitationType.PRESENTER) {
                continue;
            }

            // 2. Create or Update Invitation
            EventInvitation invitation = existing.orElse(new EventInvitation());
            invitation.setEvent(event);
            invitation.setInviterAccountId(event.getCreatedByAccountId());
            invitation.setInviteeEmail(email);
            invitation.setInviteeName((String) invMap.get("fullName"));
            
            // Try to get accountId from map or look it up by email
            String accountId = (String) invMap.get("inviteeAccountId");
            if (accountId == null || accountId.isBlank()) {
                log.info("inviteeAccountId missing for presenter {}, attempting lookup by email", email);
                List<UserDto> users = identityClient.getUsersByEmails(List.of(email));
                if (!users.isEmpty()) {
                    UserDto userDto = users.get(0);
                    accountId = userDto.getId();
                    log.info("Found accountId {} for presenter email {}", accountId, email);
                    
                    // Enrich name
                    String currentName = invitation.getInviteeName();
                    if (currentName == null || currentName.isBlank() || currentName.equals(email) || currentName.matches("\\d+")) {
                        if (userDto.getFullName() != null && !userDto.getFullName().isBlank()) {
                            invitation.setInviteeName(userDto.getFullName());
                        }
                    }
                }
            }
            invitation.setInviteeAccountId(accountId);
            
            invitation.setPresenterSession((String) invMap.getOrDefault("session", invMap.get("presenterSession")));
            invitation.setPresenterBio((String) invMap.get("bio"));
            invitation.setType(InvitationType.PRESENTER);
            invitation.setStatus(InvitationStatus.PENDING);
            invitation.setToken(UUID.randomUUID().toString());
            invitation.setSentAt(LocalDateTime.now());
            invitation.setExpiredAt(LocalDateTime.now().plusDays(7));
            
            invitationRepository.save(invitation);

            // 3. Send Email
            String inviteUrl = "http://localhost:5173/invitation/accept?eventId=" + eventId + "&token=" + invitation.getToken();
            try {
                emailService.sendPresenterInviteEmailAsync(
                        email, inviteUrl, event.getTitle(), invitation.getInviteeName(),
                        event.getStartTime().toString(), 
                        invitation.getPresenterSession() != null ? invitation.getPresenterSession() : "Chưa xác định"
                );
            } catch (Exception e) {
                log.error("Failed to send presenter invite email to {}: {}", email, e.getMessage());
            }

            // 4. Send Web Notification
            try {
                if (invitation.getInviteeAccountId() != null && !invitation.getInviteeAccountId().isBlank()) {
                    log.info("#### [PRESENTER INVITE] Sending web notification to: {}", invitation.getInviteeAccountId());
                    NotificationEvent notification = NotificationEvent.builder()
                            .recipientId(invitation.getInviteeAccountId())
                            .title("Lời mời tham gia Diễn giả")
                            .message("Bạn được mời tham gia Diễn giả tại sự kiện: \"" + event.getTitle() + "\"")
                            .type("INVITATION")
                            .relatedEntityId(event.getId())
                            .actionUrl("/invitation/accept?eventId=" + eventId + "&token=" + invitation.getToken())
                            .build();
                    notificationProducer.sendNotification(notification);
                } else {
                    log.warn("#### [PRESENTER INVITE] Skip web notification: No accountId for {}", email);
                }
            } catch (Exception e) {
                log.error("#### [PRESENTER INVITE] Failed to send web notification: {}", e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void cancelInvitation(String invitationId) {
        log.info("Hủy lời mời ID: {}", invitationId);
        invitationRepository.findById(invitationId).ifPresent(invitation -> {
            invitationRepository.delete(invitation);
            log.info("Đã xóa lời mời ID: {}", invitationId);
        });
    }

    private void processInvitations(Event event, List<Map<String, Object>> invitations) {
        sendOrganizerInvitations(event.getId(), invitations);
    }

    private void processPresenterInvitations(Event event, Set<EventPresenter> presenters) {
        List<Map<String, Object>> invitations = presenters.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("inviteeEmail", p.getEmail());
            map.put("fullName", p.getFullName());
            map.put("inviteeAccountId", p.getPresenterAccountId());
            map.put("bio", p.getBio());
            map.put("session", p.getTargetSessionName());
            return map;
        }).collect(Collectors.toList());
        sendPresenterInvitations(event.getId(), invitations);
    }

    @Override
    @Transactional
    public Event saveDraft(Event event) {
        event.setStatus(EventStatus.DRAFT);
        if (event.getSlug() == null || event.getSlug().isBlank()) {
            event.setSlug(generateSlug(event.getTitle()));
        }
        event.setCreatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    @Override
    public List<String> getOrganizerRoles(String accountId) {
        return organizerRepository.findByAccountId(accountId).stream()
                .filter(o -> !o.isDeleted())
                .map(o -> o.getRole().name())
                .distinct()
                .collect(Collectors.toList());
    }
}