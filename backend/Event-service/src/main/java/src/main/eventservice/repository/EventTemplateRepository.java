package src.main.eventservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventTemplate;
import java.util.List;

@Repository
public interface EventTemplateRepository extends JpaRepository<EventTemplate, String> {
    List<EventTemplate> findByOrganizationId(String organizationId);
    Page<EventTemplate> findByOrganizationIdAndTemplateNameContainingIgnoreCase(
            String organizationId,
            String templateName,
            Pageable pageable
    );

    Page<EventTemplate> findByTemplateNameContainingIgnoreCase(String templateName, Pageable pageable);
}