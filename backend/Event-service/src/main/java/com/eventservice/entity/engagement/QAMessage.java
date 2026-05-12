package com.eventservice.entity.engagement;

import com.eventservice.entity.core.Event;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_qa_messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QAMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String eventId;

    @Column(nullable = false)
    private String senderAccountId;

    private String senderName;
    private String senderAvatar;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    private boolean isAnswered = false;

    @Column(columnDefinition = "TEXT")
    private String answerContent;

    private String answeredByAccountId;
    private String answeredByName;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    private boolean isHidden = false;

    @Builder.Default
    private int upvotes = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_ref_id")
    @JsonIgnore
    private Event event;
}
