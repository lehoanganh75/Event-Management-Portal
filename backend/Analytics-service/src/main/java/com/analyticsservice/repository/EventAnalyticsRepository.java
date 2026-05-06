package com.analyticsservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.analyticsservice.entity.EventAnalytic;

@Repository
public interface EventAnalyticsRepository extends JpaRepository<EventAnalytic, String> {
    
    @Modifying
    @Query("UPDATE EventAnalytic e SET e.totalLikes = e.totalLikes + 1 WHERE e.eventId = :eventId")
    void incrementLikes(@Param("eventId") String eventId);

    @Modifying
    @Query("UPDATE EventAnalytic e SET e.totalRegistrations = e.totalRegistrations + 1 WHERE e.eventId = :eventId")
    void incrementRegistrations(@Param("eventId") String eventId);

    @Modifying
    @Query("UPDATE EventAnalytic e SET e.totalAttendees = e.totalAttendees + 1 WHERE e.eventId = :eventId")
    void incrementAttendees(@Param("eventId") String eventId);
}
