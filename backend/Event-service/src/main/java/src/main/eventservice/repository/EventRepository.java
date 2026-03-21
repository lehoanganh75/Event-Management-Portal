package src.main.eventservice.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.enums.EventStatus;

import java.util.List;

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
        HAVING COUNT(r.id) = (
            SELECT COUNT(r2.id) 
            FROM Event e2 
            LEFT JOIN e2.registrations r2 
            WHERE e2.isDeleted = false
            AND FUNCTION('MONTH', e2.startTime) = FUNCTION('MONTH', CURRENT_DATE)
            AND FUNCTION('YEAR', e2.startTime) = FUNCTION('YEAR', CURRENT_DATE)
            GROUP BY e2.id 
            ORDER BY COUNT(r2.id) DESC 
            LIMIT 1
        )
    """)
    List<Event> findTopFeaturedEventsThisMonth();

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
    @Query("UPDATE Event e SET e.isDeleted = true, e.status = 'CANCELLED' WHERE e.id = :id")
    void softDeleteById(@Param("id") String id);

    List<Event> findByStatusInAndIsDeletedFalse(List<EventStatus> statuses);

    List<Event> findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
            List<EventStatus> statuses, String createdByAccountId);


    // 2. Các hàm dùng @Query (Giữ nguyên hoặc sửa cho chuẩn JPQL)
    @Query("SELECT e FROM Event e WHERE e.status = src.main.eventservice.entity.enums.EventStatus.ONGOING AND e.isDeleted = false")
    List<Event> findOngoingEvents(Pageable pageable);

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId")
    long countRegistrationsByEventId(@Param("eventId") String eventId);

    List<Event> id(String id);

    List<Event> findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(List<EventStatus> statuses);
}