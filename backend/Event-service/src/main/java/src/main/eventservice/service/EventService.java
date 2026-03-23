package src.main.eventservice.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import src.main.eventservice.dto.PlanResponseDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.enums.EventStatus;

import java.util.List;
import java.util.Optional;

public interface EventService {

    // ==================== QUẢN LÝ SỰ KIỆN CHUNG ====================

    List<Event> getAllEvents();

    Page<Event> getAllEvents(PageRequest pageable);

    List<Event> getFeaturedEvents();

    Optional<Event> getEventById(String id);

    List<Event> getMyEventsByAccountAndMonth(String accountId);

    Event createEvent(Event event);

    Event saveEvent(Event event);

    @Transactional
    Event updateEvent(String id, Event eventDetails);

    void deleteEvent(String id);

    void updateLuckyDrawId(String id, String luckyDrawId);

    // ==================== QUẢN LÝ KẾ HOẠCH (PLAN) ====================

    List<Event> getAllPlans();

    List<Event> getPlansByStatus(EventStatus status);

    List<Event> getPlansByStatusById(EventStatus status, String accountId);

    @Transactional
    Event createPlan(Event event);

    @Transactional
    Event updatePlan(String id, Event planDetails);

    @Transactional
    void deletePlan(String id);

    /**
     * Gửi kế hoạch để phê duyệt (DRAFT -> PLAN_PENDING_APPROVAL)
     */
    @Transactional
    Event submitPlanForApproval(String id);

    /**
     * Admin phê duyệt kế hoạch (PLAN_PENDING_APPROVAL -> PLAN_APPROVED)
     */
    @Transactional
    Event approvePlan(String id, String approverId);

    /**
     * Admin từ chối kế hoạch (PLAN_PENDING_APPROVAL -> CANCELLED)
     */
    @Transactional
    Event rejectPlan(String id, String approverId, String reason);

    // ==================== QUẢN LÝ SỰ KIỆN (EVENT) ====================

    /**
     * BTC tạo sự kiện từ kế hoạch đã duyệt (PLAN_APPROVED -> EVENT_PENDING_APPROVAL)
     */
    @Transactional
    Event createEventFromPlan(String planId, Event eventDetails);

    /**
     * Admin phê duyệt sự kiện (EVENT_PENDING_APPROVAL -> PUBLISHED)
     */
    @Transactional
    Event approveEvent(String id, String approverId);

    /**
     * Admin từ chối sự kiện (EVENT_PENDING_APPROVAL -> CANCELLED)
     */
    @Transactional
    Event rejectEvent(String id, String approverId, String reason);

    /**
     * Cập nhật trạng thái sự kiện khi bắt đầu (PUBLISHED -> ONGOING)
     */
    @Transactional
    Event startEvent(String id);

    /**
     * Cập nhật trạng thái sự kiện khi kết thúc (ONGOING -> COMPLETED)
     */
    @Transactional
    Event completeEvent(String id);

    /**
     * Hủy sự kiện/kế hoạch (bất kỳ trạng thái nào -> CANCELLED)
     */
    @Transactional
    Event cancelEvent(String id, String reason);

    // ==================== PHƯƠNG THỨC CŨ (GIỮ LẠI ĐỂ TƯƠNG THÍCH) ====================

    /**
     * @deprecated Sử dụng các phương thức chuyên biệt thay thế:
     * - submitPlanForApproval() cho gửi duyệt kế hoạch
     * - approvePlan() cho phê duyệt kế hoạch
     * - approveEvent() cho phê duyệt sự kiện
     */
    @Deprecated
    @Transactional
    Event updateEventStatus(String id, EventStatus status, String approverId, String accountId);

    // ==================== DTO METHODS ====================

    List<PlanResponseDto> getAllPlansEnriched();

    List<PlanResponseDto> getPlansByAccountId(String accountId);

    List<PlanResponseDto> getEventsByAccountId(String accountId);

    List<PlanResponseDto> getEventsByStatus(EventStatus status);

    /**
     * Lấy danh sách kế hoạch đang chờ phê duyệt (cho admin)
     */
    List<PlanResponseDto> getPlansPendingApproval();

    /**
     * Lấy danh sách sự kiện đang chờ phê duyệt (cho admin)
     */
    List<PlanResponseDto> getEventsPendingApproval();
}