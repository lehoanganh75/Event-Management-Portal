package com.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_starred_templates",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"userId", "templateId"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStarredTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId; // accountId from JWT

    @Column(nullable = false)
    private String templateId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
