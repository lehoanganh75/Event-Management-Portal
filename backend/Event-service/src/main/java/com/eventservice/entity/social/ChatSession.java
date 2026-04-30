package com.eventservice.entity.social;

import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

import com.eventservice.entity.enums.ChatSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "session_id", unique = true, nullable = false)
    private String sessionId; // For guest tracking (UUID or browser fingerprint)
    
    @Column(name = "user_id")
    private String userId; // Null for guest, populated for authenticated users
    
    @Column(name = "guest_name")
    private String guestName; // Optional name for guest
    
    @Column(name = "guest_email")
    private String guestEmail; // Optional email for guest
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChatSessionStatus status;
    
    @Column(name = "context_type")
    private String contextType; // EVENT_PLANNING, GENERAL_INQUIRY, EVENT_REGISTRATION
    
    @Column(name = "context_id")
    private String contextId; // EventPlanner ID if related to planning
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ChatMessage> messages = new ArrayList<>();
    
    @Column(name = "satisfaction_rating")
    private Integer satisfactionRating; // 1-5 stars
    
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ChatSessionStatus.ACTIVE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
