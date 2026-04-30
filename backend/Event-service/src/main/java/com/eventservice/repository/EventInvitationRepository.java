package com.eventservice.repository;

import com.eventservice.entity.registration.EventInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventInvitationRepository extends JpaRepository<EventInvitation, String> {
    @Query("SELECT i FROM EventInvitation i JOIN FETCH i.event WHERE i.token = :token")
    Optional<EventInvitation> findByToken(@Param("token") String token);

    Optional<EventInvitation> findByEventIdAndToken(String eventId, String token);
    
    java.util.List<EventInvitation> findByEventId(String eventId);

    Optional<EventInvitation> findByEventIdAndInviteeEmail(String eventId, String inviteeEmail);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE event_invitations SET is_deleted = 1, status = 'EXPIRED' WHERE event_id = :eventId", nativeQuery = true)
    void softDeleteByEventId(@Param("eventId") String eventId);
}
