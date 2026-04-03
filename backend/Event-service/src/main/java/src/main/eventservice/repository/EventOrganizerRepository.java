package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventOrganizer;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, String> {
    List<EventOrganizer> findByEventId(String eventId);

    @Query("SELECT eo FROM EventOrganizer eo WHERE eo.event.id = :eventId AND eo.accountId = :accountId AND eo.role = 'LEADER'")
    Optional<EventOrganizer> findByEventIdAndOrganizerAccountId(String eventId, String accountId);

    boolean existsByEventIdAndAccountId(String eventId, String id);
}
