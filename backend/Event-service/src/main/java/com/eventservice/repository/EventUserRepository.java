package com.eventservice.repository;

import com.eventservice.entity.EventUser;
import com.eventservice.entity.enums.OrganizerRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventUserRepository extends JpaRepository<EventUser, String> {
    List<EventUser> findByEventId(String eventId);
    List<EventUser> findByEventIdAndRole(String eventId, OrganizerRole role);
    Optional<EventUser> findByEventIdAndAccountId(String eventId, String accountId);
    boolean existsByEventIdAndAccountId(String eventId, String accountId);
}
