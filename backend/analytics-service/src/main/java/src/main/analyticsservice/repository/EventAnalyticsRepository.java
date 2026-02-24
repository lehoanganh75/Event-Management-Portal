package src.main.analyticsservice.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import src.main.analyticsservice.entity.EventAnalytic;

import java.util.List;

@Repository
public interface EventAnalyticsRepository extends JpaRepository<EventAnalytic, String> {
    @Query("SELECT e FROM EventAnalytic e ORDER BY (e.totalLikes + e.totalComments) DESC")
    List<EventAnalytic> findTopTrendingEvents(Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE EventAnalytic e SET e.totalLikes = e.totalLikes + 1 WHERE e.eventId = :id")
    void incrementLikes(String id);

    @Modifying
    @Transactional
    @Query("UPDATE EventAnalytic e SET e.totalRegistrations = e.totalRegistrations + 1 WHERE e.eventId = :id")
    void incrementRegistrations(String id);

    @Modifying
    @Transactional
    @Query("UPDATE EventAnalytic e SET e.totalAttendees = e.totalAttendees + 1 WHERE e.eventId = :id")
    void incrementAttendees(String id);
}
