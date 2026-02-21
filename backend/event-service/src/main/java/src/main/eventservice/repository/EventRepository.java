package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.Event;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    @Query("SELECT e FROM Event e WHERE e.status = 'Ongoing' ORDER BY e.startTime ASC")
    List<Event> findOngoingEvents(Pageable pageable);
    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId")
    long countRegistrationsByEventId(@Param("eventId") String eventId);
}