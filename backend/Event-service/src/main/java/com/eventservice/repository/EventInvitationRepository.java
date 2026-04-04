package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.EventInvitation;

import java.util.Optional;

@Repository
public interface EventInvitationRepository extends JpaRepository<EventInvitation, String> {
    Optional<EventInvitation> findByToken(String token);
}
