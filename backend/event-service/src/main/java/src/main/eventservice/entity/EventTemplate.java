package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import src.main.eventservice.entity.enums.EventType;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String organizationId;

    private String templateName;

    @Enumerated(EnumType.STRING)
    private EventType templateType;
    private String customTemplateType;

    private String description;

    private String defaultTitle;
    @Column(columnDefinition = "TEXT")
    private String defaultDescription;
    private String defaultCoverImage;
    private String defaultLocation;
    private String defaultEventMode;
    private int defaultMaxParticipants;

    @Builder.Default
    private int usageCount = 0;

    @Column(columnDefinition = "TEXT")
    private String configData;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}