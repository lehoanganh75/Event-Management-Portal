package src.main.eventservice.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    // ==================== QUERY CƠ BẢN ====================

    List<Event> findAllByIsDeletedFalseOrderByStartTimeDesc();

    @Query("""
        SELECT e FROM Event e 
        LEFT JOIN e.registrations r
        WHERE e.isDeleted = false 
        AND e.status IN (
            src.main.eventservice.entity.enums.EventStatus.PUBLISHED,
            src.main.eventservice.entity.enums.EventStatus.ONGOING,
            src.main.eventservice.entity.enums.EventStatus.COMPLETED
        )
        AND FUNCTION('MONTH', e.startTime) = FUNCTION('MONTH', CURRENT_DATE)
        AND FUNCTION('YEAR', e.startTime) = FUNCTION('YEAR', CURRENT_DATE)
        GROUP BY e.id
        ORDER BY COUNT(r.id) DESC
    """)
    List<Event> findTopFeaturedEventsThisMonth(Pageable pageable);

    @Query("""
        SELECT DISTINCT e FROM Event e 
        JOIN FETCH e.registrations r 
        WHERE r.userRegistrationId = :accountId 
        AND e.isDeleted = false 
        AND r.status = 'REGISTERED'
        AND FUNCTION('MONTH', e.startTime) = FUNCTION('MONTH', CURRENT_DATE)
        AND FUNCTION('YEAR', e.startTime) = FUNCTION('YEAR', CURRENT_DATE)
        ORDER BY e.startTime ASC
    """)
    List<Event> findEventsByRegistrationAndMonth(@Param("accountId") String accountId);

    @Transactional
    @Modifying
    @Query("UPDATE Event e SET e.isDeleted = true, e.status = src.main.eventservice.entity.enums.EventStatus.CANCELLED WHERE e.id = :id")
    void softDeleteById(@Param("id") String id);

    Optional<Event> findById(String id);

    List<Event> findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
            String accountId,
            LocalDateTime startDate,
            LocalDateTime endDate);

    // ==================== QUERY CHO KẾ HOẠCH (PLAN) ====================

    /**
     * Tìm tất cả kế hoạch với danh sách trạng thái (DRAFT, PLAN_PENDING_APPROVAL, PLAN_APPROVED, CANCELLED)
     */
    List<Event> findByStatusInAndIsDeletedFalse(List<EventStatus> statuses);

    /**
     * Tìm kế hoạch theo trạng thái và accountId
     */
    List<Event> findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
            List<EventStatus> statuses, String createdByAccountId);

    /**
     * Tìm kế hoạch đang chờ duyệt (PLAN_PENDING_APPROVAL)
     */
    List<Event> findByStatusAndIsDeletedFalse(EventStatus status);

    /**
     * Tìm kế hoạch đã được duyệt (PLAN_APPROVED)
     */
    @Query("SELECT e FROM Event e WHERE e.status = :status AND e.isDeleted = false")
    List<Event> findApprovedPlans(@Param("status") EventStatus status);

    // ==================== QUERY CHO SỰ KIỆN (EVENT) ====================

    /**
     * Tìm tất cả sự kiện đã publish trở lên (PUBLISHED, ONGOING, COMPLETED)
     */
    List<Event> findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(List<EventStatus> statuses);

    /**
     * Tìm sự kiện theo trạng thái (không bao gồm kế hoạch)
     */
    List<Event> findByStatusAndIsDeletedFalseOrderByStartTimeDesc(EventStatus status);

    /**
     * Tìm sự kiện đang diễn ra (ONGOING)
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.ONGOING 
        AND e.isDeleted = false
    """)
    List<Event> findOngoingEvents(Pageable pageable);

    /**
     * Tìm sự kiện đã publish và đang diễn ra (cho featured events)
     */
    @Query("""
        SELECT e FROM Event e
        WHERE e.status IN (
            src.main.eventservice.entity.enums.EventStatus.PUBLISHED,
            src.main.eventservice.entity.enums.EventStatus.ONGOING
        )
        AND e.archived = false
        AND e.isDeleted = false
    """)
    List<Event> findCandidateEvents();

    /**
     * Tìm sự kiện theo accountId (PUBLISHED, ONGOING, COMPLETED)
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.createdByAccountId = :accountId 
        AND e.isDeleted = false
        AND e.status IN (
            src.main.eventservice.entity.enums.EventStatus.PUBLISHED,
            src.main.eventservice.entity.enums.EventStatus.ONGOING,
            src.main.eventservice.entity.enums.EventStatus.COMPLETED
        )
    """)
    List<Event> findEventsByAccountId(@Param("accountId") String accountId);

    // ==================== QUERY CHO ADMIN ====================

    /**
     * Lấy tất cả kế hoạch đang chờ duyệt (PLAN_PENDING_APPROVAL)
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.PLAN_PENDING_APPROVAL 
        AND e.isDeleted = false
        ORDER BY e.createdAt ASC
    """)
    List<Event> findPlansPendingApproval();

    /**
     * Lấy tất cả sự kiện đang chờ duyệt (EVENT_PENDING_APPROVAL)
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.EVENT_PENDING_APPROVAL 
        AND e.isDeleted = false
        ORDER BY e.createdAt ASC
    """)
    List<Event> findEventsPendingApproval();

    /**
     * Lấy tất cả kế hoạch (bao gồm DRAFT, PLAN_PENDING_APPROVAL, PLAN_APPROVED, CANCELLED)
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.status IN (
            src.main.eventservice.entity.enums.EventStatus.DRAFT,
            src.main.eventservice.entity.enums.EventStatus.PLAN_PENDING_APPROVAL,
            src.main.eventservice.entity.enums.EventStatus.PLAN_APPROVED,
            src.main.eventservice.entity.enums.EventStatus.CANCELLED
        )
        AND e.isDeleted = false
        ORDER BY e.updatedAt DESC
    """)
    List<Event> findAllPlans();

    /**
     * Lấy tất cả sự kiện đã được phê duyệt (PUBLISHED, ONGOING, COMPLETED)
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.status IN (
            src.main.eventservice.entity.enums.EventStatus.PUBLISHED,
            src.main.eventservice.entity.enums.EventStatus.ONGOING,
            src.main.eventservice.entity.enums.EventStatus.COMPLETED
        )
        AND e.isDeleted = false
        ORDER BY e.startTime DESC
    """)
    List<Event> findAllPublishedEvents();

    // ==================== QUERY THỐNG KÊ ====================

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId")
    long countRegistrationsByEventId(@Param("eventId") String eventId);

    /**
     * Đếm số kế hoạch đang chờ duyệt
     */
    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.PLAN_PENDING_APPROVAL AND e.isDeleted = false")
    long countPlansPendingApproval();

    /**
     * Đếm số sự kiện đang chờ duyệt
     */
    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.EVENT_PENDING_APPROVAL AND e.isDeleted = false")
    long countEventsPendingApproval();

    /**
     * Đếm số sự kiện đang diễn ra
     */
    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.ONGOING AND e.isDeleted = false")
    long countOngoingEvents();

    /**
     * Đếm số sự kiện đã hoàn thành trong tháng
     */
    @Query("""
        SELECT COUNT(e) FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.COMPLETED 
        AND e.isDeleted = false
        AND FUNCTION('MONTH', e.endTime) = FUNCTION('MONTH', CURRENT_DATE)
        AND FUNCTION('YEAR', e.endTime) = FUNCTION('YEAR', CURRENT_DATE)
    """)
    long countCompletedEventsThisMonth();

    // ==================== QUERY TÌM KIẾM ====================

    /**
     * Tìm kiếm kế hoạch theo tiêu đề
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.isDeleted = false 
        AND e.status IN (
            src.main.eventservice.entity.enums.EventStatus.DRAFT,
            src.main.eventservice.entity.enums.EventStatus.PLAN_PENDING_APPROVAL,
            src.main.eventservice.entity.enums.EventStatus.PLAN_APPROVED
        )
        AND LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY e.updatedAt DESC
    """)
    List<Event> searchPlansByKeyword(@Param("keyword") String keyword);

    /**
     * Tìm kiếm sự kiện theo tiêu đề
     */
    @Query("""
        SELECT e FROM Event e 
        WHERE e.isDeleted = false 
        AND e.status IN (
            src.main.eventservice.entity.enums.EventStatus.PUBLISHED,
            src.main.eventservice.entity.enums.EventStatus.ONGOING,
            src.main.eventservice.entity.enums.EventStatus.COMPLETED
        )
        AND LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY e.startTime DESC
    """)
    List<Event> searchEventsByKeyword(@Param("keyword") String keyword);

    // ==================== PHƯƠNG THỨC CŨ (GIỮ LẠI ĐỂ TƯƠNG THÍCH) ====================

    /**
     * @deprecated Sử dụng findByStatusInAndIsDeletedFalse thay thế
     */
    @Deprecated
    List<Event> findByStatusInAndDeletedIsNullAndCreatedByAccountId(List<String> statuses, String accountId);
}