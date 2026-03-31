package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventOrganizer;

import java.util.List;

@Repository
public interface EventOrganizerRepository  extends JpaRepository<EventOrganizer, String> {
    List<EventOrganizer> findByEventId(String eventId);
}
