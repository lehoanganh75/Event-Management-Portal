package src.main.analyticsservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.analyticsservice.entity.EventAnalytic;

@Repository
public interface EventAnalyticsRepository extends JpaRepository<EventAnalytic, String> {
}
