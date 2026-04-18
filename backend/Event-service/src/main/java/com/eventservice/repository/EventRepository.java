package com.eventservice.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.Event;
import com.eventservice.entity.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    Optional<Event> findById(String id);

    @EntityGraph(attributePaths = {"presenters", "organizers", "participants"})
    List<Event> findByCreatedByAccountIdAndCreatedAtBetweenAndIsDeletedFalse(
            String accountId, LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {"presenters", "organizers", "participants"})
    List<Event> findByStatusInAndIsDeletedFalseAndCreatedByAccountId(
            List<EventStatus> statuses, String accountId);

    Optional<Event> findByIdAndIsDeletedFalse(String id);

    List<Event> findByCreatedByAccountIdAndStatusInAndStartTimeBetweenAndIsDeletedFalse(
            String accountId,
            Collection<EventStatus> statuses,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT e FROM Event e WHERE e.organization.ownerAccountId = :ownerId AND e.isDeleted = false")
    List<Event> findEventsByOrganizationOwner(@Param("ownerId") String ownerId);

    // Truy vấn qua bảng trung gian EventOrganizer
    @Query("SELECT e FROM Event e JOIN e.organizers o WHERE o.accountId = :accId AND e.isDeleted = false AND o.isDeleted = false")
    List<Event> findEventsByOrganizerAccountId(@Param("accId") String accId);

    // Truy vấn qua bảng EventPresenter
    @Query("SELECT e FROM Event e JOIN e.presenters p WHERE p.presenterAccountId = :accId AND e.isDeleted = false")
    List<Event> findEventsByPresenterAccountId(@Param("accId") String accId);

    // Truy vấn qua bảng EventParticipant/Registration
    @Query("SELECT e FROM Event e JOIN e.registrations r WHERE r.participantAccountId = :accId AND e.isDeleted = false")
    List<Event> findEventsByParticipantAccountId(@Param("accId") String accId);

    // Truy vấn sự kiện do tôi TẠO
    @Query("SELECT e FROM Event e WHERE e.createdByAccountId = :accId AND e.isDeleted = false")
    List<Event> findByCreatedByAccountIdAndIsDeletedFalse(@Param("accId") String accId);

    // Truy vấn sự kiện do tôi PHÊ DUYỆT (Dành cho Admin/Manager)
    @Query("SELECT e FROM Event e WHERE e.approvedByAccountId = :accId AND e.isDeleted = false")
    List<Event> findByApprovedByAccountIdAndIsDeletedFalse(@Param("accId") String accId);

    @Query("SELECT e FROM Event e WHERE e.status IN :statuses " +
            "AND e.isDeleted = false " +
            "AND e.startTime <= :now " +
            "AND e.endTime >= :now " +
            "ORDER BY e.endTime ASC")
    List<Event> findOngoingEvents(@Param("statuses") List<EventStatus> statuses, @Param("now") LocalDateTime now);

    List<Event> findByStatusInAndIsDeletedFalseOrderByStartTimeDesc(List<EventStatus> statuses);
    List<Event> findByIsDeletedFalseOrderByCreatedAtDesc();
    List<Event> findByIsDeletedFalseOrderByStartTimeDesc();

    @EntityGraph(attributePaths = {"presenters", "organizers"})
    List<Event> findByStartTimeBetweenAndStatusAndIsDeletedFalse(
            LocalDateTime start,
            LocalDateTime end,
            EventStatus status
    );

    List<Event> findByStatusInAndIsDeletedFalse(List<EventStatus> statuses);

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId AND r.isDeleted = false")
    long countRegistrationsByEventId(@Param("eventId") String eventId);

    List<Event> findByStatusInAndIsDeletedFalseOrderByRegistrationDeadlineAsc(List<EventStatus> publicStatuses);

    List<Event> findByStatus(EventStatus eventStatus);
    @Query("SELECT e FROM Event e WHERE " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.eventTopic) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND e.isDeleted = false " +
           "ORDER BY e.startTime DESC")
    List<Event> searchByKeyword(@Param("keyword") String keyword);
}