package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventParticipant;
import src.main.eventservice.entity.enums.ParticipationStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, String> {

    List<EventParticipant> findByEventId(String eventId);

    List<EventParticipant> findByEventIdOrderByRegisteredAtDesc(String eventId);

    List<EventParticipant> findByEventIdAndStatus(String eventId, ParticipationStatus status);

    Optional<EventParticipant> findByEventIdAndEmail(String eventId, String email);

    boolean existsByEventIdAndEmail(String eventId, String email);

    long countByEventId(String eventId);

    long countByEventIdAndStatus(String eventId, ParticipationStatus status);

    long countByEventIdAndCheckedInTrue(String eventId);

    @Query("SELECT COUNT(p) FROM EventParticipant p WHERE p.event.id = :eventId AND p.status = :status AND p.checkedIn = true")
    long countCheckedInByEventIdAndStatus(@Param("eventId") String eventId, @Param("status") ParticipationStatus status);

    @Query("SELECT p FROM EventParticipant p WHERE p.event.id = :eventId AND p.checkedIn = true")
    List<EventParticipant> findCheckedInParticipants(@Param("eventId") String eventId);

    void deleteByEventId(String eventId);
}