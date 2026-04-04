package com.eventservice.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.Event;
import com.eventservice.entity.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    Optional<Event> findById(String id);

    @EntityGraph(attributePaths = {"presenters", "organizers", "participants"})
    List<Event> findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
            String accountId, LocalDateTime start, LocalDateTime end);

    List<Event> findByStatusInAndIsDeletedFalse(List<EventStatus> statuses);

    @EntityGraph(attributePaths = {"presenters", "organizers", "participants"})
    List<Event> findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
            List<EventStatus> statuses, String accountId);

    List<Event> findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(List<EventStatus> statuses);

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId")
    long countRegistrationsByEventId(@Param("eventId") String eventId);

    Optional<Event> findByIdAndIsDeletedFalse(String id);
}