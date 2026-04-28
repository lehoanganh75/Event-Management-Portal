package src.main.analyticsservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import src.main.analyticsservice.dto.TopCreatorDTO;
import src.main.analyticsservice.entity.AuditLog;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    @Query("SELECT new src.main.analyticsservice.dto.TopCreatorDTO(a.performedByAccountId, COUNT(a)) " +
            "FROM AuditLog a " +
            "WHERE a.action = 'CREATE_EVENT' " +
            "GROUP BY a.performedByAccountId " +
            "ORDER BY COUNT(a) DESC")
    List<TopCreatorDTO> findTopCreators();

    long countByAction(String action);
}