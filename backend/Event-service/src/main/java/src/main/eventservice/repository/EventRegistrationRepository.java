package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventRegistration;
import src.main.eventservice.entity.enums.RegistrationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, String> {
    List<EventRegistration> findByEventId(String eventId);

    // Đổi từ findByUserProfileId thành findByUserRegistrationId
    List<EventRegistration> findByUserRegistrationId(String userRegistrationId);

    // Đổi từ findByEventIdAndUserProfileId thành findByEventIdAndUserRegistrationId
    Optional<EventRegistration> findByEventIdAndUserRegistrationId(String eventId, String userRegistrationId);

    List<EventRegistration> findByEventIdAndStatus(String eventId, RegistrationStatus status);
    Optional<EventRegistration> findByQrToken(String qrToken);

    @Query("""
        SELECT r FROM EventRegistration r
        JOIN r.event e
        WHERE r.userRegistrationId = :userId
        AND r.status = src.main.eventservice.entity.enums.RegistrationStatus.REGISTERED
        AND e.isDeleted = false
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

    long countByEventIdAndStatusIn(String eventId, List<RegistrationStatus> statuses);
}