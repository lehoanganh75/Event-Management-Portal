package com.eventservice.entity;

import com.eventservice.entity.enums.ChatMessageRole;
import com.eventservice.entity.enums.ChatMessageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_session_id", nullable = false)
    private ChatSession chatSession;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ChatMessageRole role; // USER, ASSISTANT, SYSTEM

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ChatMessageType type; // TEXT, SUGGESTION, EVENT_PLAN_DRAFT, FILE_UPLOAD

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON string for additional data (suggestions, file info, etc.)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "tokens_used")
    private Integer tokensUsed; // Track AI token usage

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
    }
}