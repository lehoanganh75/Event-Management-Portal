package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.EventOrganizer;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, String> {
    List<EventOrganizer> findByEventId(String eventId);

    @Query("SELECT eo FROM EventOrganizer eo WHERE eo.event.id = :eventId AND eo.accountId = :accountId AND (eo.role = 'LEADER' OR eo.role = 'ORGANIZER')")
    Optional<EventOrganizer> findByEventIdAndOrganizerAccountId(String eventId, String accountId);

    boolean existsByEventIdAndAccountId(String eventId, String id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE event_organizers SET is_deleted = 1 WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@org.springframework.data.repository.query.Param("eventId") String eventId);
}
