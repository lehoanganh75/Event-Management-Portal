package com.eventservice.repository;

import com.eventservice.entity.social.ChatSession;
import com.eventservice.entity.enums.ChatSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    
    Optional<ChatSession> findBySessionId(String sessionId);
    
    List<ChatSession> findByUserId(String userId);
    
    List<ChatSession> findByStatus(ChatSessionStatus status);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.contextType = :contextType AND cs.contextId = :contextId")
    List<ChatSession> findByContext(@Param("contextType") String contextType, @Param("contextId") String contextId);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.status = :status AND cs.updatedAt < :cutoffTime")
    List<ChatSession> findInactiveSessions(@Param("status") ChatSessionStatus status, @Param("cutoffTime") LocalDateTime cutoffTime);
    
    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.createdAt >= :startDate")
    Long countSessionsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT cs FROM ChatSession cs LEFT JOIN FETCH cs.messages WHERE cs.sessionId = :sessionId")
    Optional<ChatSession> findBySessionIdWithMessages(@Param("sessionId") String sessionId);
}
