package com.eventservice.repository;

import com.eventservice.entity.UserStarredTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStarredTemplateRepository extends JpaRepository<UserStarredTemplate, String> {
    Optional<UserStarredTemplate> findByUserIdAndTemplateId(String userId, String templateId);
    boolean existsByUserIdAndTemplateId(String userId, String templateId);
    void deleteByUserIdAndTemplateId(String userId, String templateId);

    @org.springframework.data.jpa.repository.Query("SELECT st.templateId FROM UserStarredTemplate st WHERE st.userId = :userId")
    java.util.List<String> findTemplateIdsByUserId(String userId);
}
