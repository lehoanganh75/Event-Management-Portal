package com.eventservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.template.EventTemplate;

import java.util.List;

@Repository
public interface EventTemplateRepository extends JpaRepository<EventTemplate, String> {
    List<EventTemplate> findByOrganizationId(String organizationId);

    @Query("SELECT t FROM EventTemplate t " +
           "LEFT JOIN UserStarredTemplate st ON t.id = st.templateId AND st.userId = :userId " +
           "WHERE (t.isPublic = true OR (t.organization.id = :organizationId) OR t.organization IS NULL) AND " +
           "(LOWER(t.templateName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "t.isDeleted = false " +
           "ORDER BY (CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END) DESC, t.usageCount DESC, t.createdAt DESC")
    Page<EventTemplate> findAvailableTemplates(
            @Param("organizationId") String organizationId,
            @Param("search") String search,
            @Param("userId") String userId,
            Pageable pageable
    );

    @Query("SELECT t FROM EventTemplate t " +
           "LEFT JOIN UserStarredTemplate st ON t.id = st.templateId AND st.userId = :userId " +
           "WHERE (LOWER(t.templateName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "t.isDeleted = false " +
           "ORDER BY (CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END) DESC, t.usageCount DESC, t.createdAt DESC")
    Page<EventTemplate> findGlobalTemplates(
            @Param("search") String search,
            @Param("userId") String userId,
            Pageable pageable
    );

    Page<EventTemplate> findByOrganizationIdAndTemplateNameContainingIgnoreCase(String organizationId, String templateName, Pageable pageable);
    Page<EventTemplate> findByTemplateNameContainingIgnoreCase(String templateName, Pageable pageable);
}
