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
        AND e.status = src.main.eventservice.entity.enums.EventStatus.PUBLISHED
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

    List<Event> findByStatusInAndIsDeletedFalse(List<EventStatus> statuses);

    List<Event> findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
            List<EventStatus> statuses, String createdByAccountId);

    @Query("""
        SELECT e FROM Event e 
        WHERE e.status = src.main.eventservice.entity.enums.EventStatus.ONGOING 
        AND e.isDeleted = false
    """)
    List<Event> findOngoingEvents(Pageable pageable);

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId")
    long countRegistrationsByEventId(@Param("eventId") String eventId);

    Optional<Event> findById(String id);

    List<Event> findByStatusAndIsDeletedFalseOrderByStartTimeDesc(EventStatus status);

    List<Event> findByStatusInAndDeletedIsNullAndCreatedByAccountId(List<String> statuses, String accountId);

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
        WHERE e.status IN (
            src.main.eventservice.entity.enums.EventStatus.PUBLISHED,
            src.main.eventservice.entity.enums.EventStatus.ONGOING
        )
        AND e.archived = false
        AND e.isDeleted = false
    """)
    List<Event> findCandidateEvents();

    List<Event> findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
            String accountId,
            LocalDateTime startDate,
            LocalDateTime endDate);
}