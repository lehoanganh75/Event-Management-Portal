package src.main.eventservice.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.dto.UserDto;
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
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
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
        List<Event> featuredEvents = eventRepository.findTopFeaturedEventsThisMonth();

        if (featuredEvents.isEmpty()) {
            return Collections.emptyList();
        }

        featuredEvents.forEach(this::enrichEventWithRegistrationCount);

        return featuredEvents;
    }

    @Override
    public Optional<Event> findById(String id) {
        return eventRepository.findById(id);
    }

    @Override
    public List<Event> getMyEventsByAccountAndMonth(String accountId) {
        return eventRepository.findEventsByRegistrationAndMonth(accountId);
    }

    @Override
    public Event createEvent(Event event) {
        if (event.getSession() != null && !event.getSession().isEmpty()) {
            event.getSession().forEach(s -> s.setEvent(event));
        }

        if (event.getPosts() != null) {
            event.getPosts().forEach(p -> p.setEvent(event));
        }

        validateEventTime(event);
        return eventRepository.save(event);
    }

    private void validateEventTime(Event event) {
        if (event.getStartTime() != null && event.getEndTime() != null) {
            if (event.getStartTime().isAfter(event.getEndTime())) {
                throw new RuntimeException("Thời gian bắt đầu phải trước thời gian kết thúc");
            }
        }
    }

    @Override
    public void deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sự kiện với ID: " + id);
        }

        eventRepository.softDeleteById(id);
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
    public void updateLuckyDrawId(String id, String luckyDrawId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + id));

        event.setLuckyDrawId(luckyDrawId);

        eventRepository.save(event);
    }

    // Plans
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
        List<EventStatus> planStatuses = Arrays.asList(status);
        // Cập nhật tên hàm mới
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);
        plans.forEach(this::enrichEventWithRegistrationCount);
        return plans;
    }

    @Override
    public List<Event> getPlansByStatusById(EventStatus status, String accountId) {
        List<EventStatus> planStatuses = Arrays.asList(status);
        // Cập nhật tên hàm mới khớp với Repository
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

        if (existingEvent.getStatus() == EventStatus.PUBLISHED || existingEvent.getStatus() == EventStatus.ONGOING) {
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
        event.setDeleted(false);
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

    @Override
    public Page<Event> getAllEvents(PageRequest pageable) {
        return null;
    }

    @Override
    public List<PlanResponseDto> getAllPlansEnriched() {
        List<EventStatus> planStatuses = Arrays.asList(
                EventStatus.DRAFT,
                EventStatus.PENDING_APPROVAL,
                EventStatus.CANCELLED
        );
        List<Event> plans = eventRepository.findByStatusInAndIsDeletedFalse(planStatuses);

        return plans.stream().map(event -> {
            UserDto creator = null;
            UserDto approver = null;

            return PlanResponseDto.from(event, creator, approver);
        }).collect(Collectors.toList());
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

        return null;
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
                .map(event -> {
                    UserDto creator = null;
                    UserDto approver = null;

                    try {

                    } catch (Exception e) {
                    }

                    try {

                    } catch (Exception e) {
                    }

                    return PlanResponseDto.from(event, creator, approver);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanResponseDto> getEventsByStatus(EventStatus status) {
        // 1. Lấy danh sách từ DB
        List<Event> events = eventRepository.findByStatusInAndIsDeletedFalse(Arrays.asList(status));

        // 2. Làm giàu dữ liệu (Số lượng đăng ký)
        events.forEach(this::enrichEventWithRegistrationCount);

        // 3. Xử lý chuyển đổi sang DTO và sắp xếp
        return events.stream()
                .sorted(Comparator.comparing(Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(event -> {
                    // Ở đây bạn có thể gọi sang Identity Service (qua FeignClient hoặc RestTemplate)
                    // để lấy thông tin User dựa trên createdByAccountId và approvedByAccountId
                    UserDto creator = null;
                    UserDto approver = null;

                    // Tạm thời trả về DTO từ event
                    return PlanResponseDto.from(event, creator, approver);
                })
                .collect(Collectors.toList());
    }
}