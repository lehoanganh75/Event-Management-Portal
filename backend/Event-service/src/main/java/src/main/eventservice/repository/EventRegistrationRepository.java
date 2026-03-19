package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import src.main.eventservice.entity.EventRegistration;
import src.main.eventservice.entity.enums.RegistrationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, String> {
    List<EventRegistration> findByEventId(String eventId);
    List<EventRegistration> findByUserProfileId(String userProfileId);
    Optional<EventRegistration> findByEventIdAndUserProfileId(String eventId, String userProfileId);
    boolean existsByEventIdAndUserProfileId(String eventId, String userProfileId);
    List<EventRegistration> findByEventIdAndStatus(String eventId, RegistrationStatus status);
    Optional<EventRegistration> findByQrToken(String qrToken);

    @Query("""
        SELECT r FROM EventRegistration r
        JOIN r.event e
        WHERE r.userProfileId = :userId
        AND r.status = 'Registered'
        AND e.deletedAt IS NULL
        AND e.startTime < :endTime
        AND e.endTime > :startTime
        AND e.id != :excludeEventId
    """)
    List<EventRegistration> findConflictingRegistrations(
            @Param("userId") String userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeEventId") String excludeEventId
    );
}