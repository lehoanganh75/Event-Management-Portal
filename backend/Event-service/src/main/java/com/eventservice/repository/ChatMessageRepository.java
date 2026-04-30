package com.eventservice.repository;

import com.eventservice.entity.social.ChatMessage;
import com.eventservice.entity.enums.ChatMessageRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    
    List<ChatMessage> findByChatSessionIdOrderByCreatedAtAsc(String chatSessionId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.sessionId = :sessionId ORDER BY cm.createdAt ASC")
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(@Param("sessionId") String sessionId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND cm.role = :role")
    List<ChatMessage> findByChatSessionIdAndRole(@Param("chatSessionId") String chatSessionId, @Param("role") ChatMessageRole role);
    
    @Query("SELECT SUM(cm.tokensUsed) FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId")
    Integer getTotalTokensUsed(@Param("chatSessionId") String chatSessionId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.createdAt >= :startDate")
    Long countMessagesSince(@Param("startDate") LocalDateTime startDate);
}
