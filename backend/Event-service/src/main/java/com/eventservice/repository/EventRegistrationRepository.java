package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.EventRegistration;
import com.eventservice.entity.enums.RegistrationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, String> {

    List<EventRegistration> findByEventId(String eventId);

    // SỬA: Đổi từ userRegistrationId thành participantAccountId cho khớp Entity
    List<EventRegistration> findByParticipantAccountId(String participantAccountId);

    // SỬA: Đổi tên hàm tìm kiếm theo cặp Event và Participant
    Optional<EventRegistration> findByEventIdAndParticipantAccountId(String eventId, String participantAccountId);

    List<EventRegistration> findByEventIdAndStatus(String eventId, RegistrationStatus status);

    Optional<EventRegistration> findByQrToken(String qrToken);

    // SỬA: Cập nhật lại Query JPQL cho khớp với tên trường mới
    @Query("""
        SELECT r FROM EventRegistration r 
        JOIN r.event e 
        WHERE r.participantAccountId = :userId 
        AND r.status = :status 
        AND e.isDeleted = false 
        AND e.startTime < :endTime 
        AND e.endTime > :startTime 
        AND e.id != :excludeEventId
    """)
    List<EventRegistration> findConflictingRegistrations(
            @Param("userId") String userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeEventId") String excludeEventId,
            @Param("status") RegistrationStatus status // Thêm tham số này
    );

    long countByEventIdAndStatusIn(String eventId, List<RegistrationStatus> statuses);

    boolean existsByEventIdAndParticipantAccountIdAndIsDeletedFalse(String eventId, String userId);

    long countByEventId(String eventId);

    Optional<EventRegistration> findByEventIdAndParticipantAccountIdAndIsDeletedFalse(String registrationId, String userId);
}