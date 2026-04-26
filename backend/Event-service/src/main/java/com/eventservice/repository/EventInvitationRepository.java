package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.EventInvitation;

import java.util.Optional;

@Repository
public interface EventInvitationRepository extends JpaRepository<EventInvitation, String> {
    Optional<EventInvitation> findByToken(String token);

    Optional<EventInvitation> findByEventIdAndToken(String eventId, String token);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE event_invitations SET status = 'CANCELED' WHERE event_id = :eventId AND status = 'PENDING'", nativeQuery = true)
    void softDeleteByEventId(@org.springframework.data.repository.query.Param("eventId") String eventId);
}
