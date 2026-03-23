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

    List<Event> findByStatusInAndIsDeletedFalse(List<EventStatus> statuses);

    List<Event> findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
            List<EventStatus> statuses, String createdByAccountId);

    List<Event> findByStatusAndIsDeletedFalse(EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.status = :status AND e.isDeleted = false")
    List<Event> findApprovedPlans(@Param("status") EventStatus status);

    List<Event> findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(List<EventStatus> statuses);

    List<Event> findByStatusAndIsDeletedFalseOrderByStartTimeDesc(EventStatus status);

    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.ONGOING 
        AND e.isDeleted = false
    """)
    List<Event> findOngoingEvents(Pageable pageable);

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

    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.PLAN_PENDING_APPROVAL 
        AND e.isDeleted = false
        ORDER BY e.createdAt ASC
    """)
    List<Event> findPlansPendingApproval();

    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.EVENT_PENDING_APPROVAL 
        AND e.isDeleted = false
        ORDER BY e.createdAt ASC
    """)
    List<Event> findEventsPendingApproval();

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

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId")
    long countRegistrationsByEventId(@Param("eventId") String eventId);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.PLAN_PENDING_APPROVAL AND e.isDeleted = false")
    long countPlansPendingApproval();

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.EVENT_PENDING_APPROVAL AND e.isDeleted = false")
    long countEventsPendingApproval();


    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.ONGOING AND e.isDeleted = false")
    long countOngoingEvents();

    @Query("""
        SELECT COUNT(e) FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.COMPLETED 
        AND e.isDeleted = false
        AND FUNCTION('MONTH', e.endTime) = FUNCTION('MONTH', CURRENT_DATE)
        AND FUNCTION('YEAR', e.endTime) = FUNCTION('YEAR', CURRENT_DATE)
    """)
    long countCompletedEventsThisMonth();

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

    @Deprecated
    List<Event> findByStatusInAndDeletedIsNullAndCreatedByAccountId(List<String> statuses, String accountId);

}