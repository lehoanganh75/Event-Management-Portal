package com.eventservice.scheduler;

import com.eventservice.entity.social.ChatSession;
import com.eventservice.entity.enums.ChatSessionStatus;
import com.eventservice.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatSessionCleanupScheduler {
    
    private final ChatSessionRepository chatSessionRepository;
    
    /**
     * Archive inactive chat sessions (no activity for 24 hours)
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void archiveInactiveSessions() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        
        List<ChatSession> inactiveSessions = chatSessionRepository.findInactiveSessions(
                ChatSessionStatus.ACTIVE,
                cutoffTime
        );
        
        if (!inactiveSessions.isEmpty()) {
            inactiveSessions.forEach(session -> {
                session.setStatus(ChatSessionStatus.ARCHIVED);
                session.setEndedAt(LocalDateTime.now());
            });
            
            chatSessionRepository.saveAll(inactiveSessions);
            log.info("Archived {} inactive chat sessions", inactiveSessions.size());
        }
    }
    
    /**
     * Delete old archived sessions (older than 30 days)
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    @Transactional
    public void deleteOldArchivedSessions() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(30);
        
        List<ChatSession> oldSessions = chatSessionRepository.findInactiveSessions(
                ChatSessionStatus.ARCHIVED,
                cutoffTime
        );
        
        if (!oldSessions.isEmpty()) {
            chatSessionRepository.deleteAll(oldSessions);
            log.info("Deleted {} old archived chat sessions", oldSessions.size());
        }
    }
}
