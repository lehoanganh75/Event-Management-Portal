package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.people.EventOrganizer;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, String> {
    List<EventOrganizer> findByEventId(String eventId);

    @Query("SELECT eo FROM EventOrganizer eo WHERE eo.event.id = :eventId AND eo.accountId = :accountId AND eo.role = 'LEADER'")
    Optional<EventOrganizer> findByEventIdAndOrganizerAccountId(String eventId, String accountId);

    boolean existsByEventIdAndAccountId(String eventId, String id);

    List<EventOrganizer> findByAccountId(String accountId);

    Optional<EventOrganizer> findFirstByEventIdAndAccountId(String eventId, String accountId);

    @Query("""
        SELECT eo FROM EventOrganizer eo 
        JOIN eo.event e 
        WHERE eo.accountId = :userId 
        AND eo.isDeleted = false 
        AND e.isDeleted = false 
        AND e.startTime < :endTime 
        AND e.endTime > :startTime 
        AND e.id != :excludeEventId
    """)
    List<EventOrganizer> findConflictingOrganizers(
            @Param("userId") String userId,
            @Param("startTime") java.time.LocalDateTime startTime,
            @Param("endTime") java.time.LocalDateTime endTime,
            @Param("excludeEventId") String excludeEventId
    );

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE event_organizers SET is_deleted = 1, status = 'INACTIVE' WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@Param("eventId") String eventId);
}
