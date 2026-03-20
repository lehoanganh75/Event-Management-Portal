package src.main.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import src.main.eventservice.entity.enums.EventType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private String faculty;
    private String major;

    @Builder.Default
    private int usageCount = 0;

    @Column(columnDefinition = "TEXT")
    private String configData;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted;

    @ElementCollection
    @CollectionTable(
            name = "event_template_themes",
            joinColumns = @JoinColumn(name = "template_id")
    )
    @Column(name = "theme")
    @Builder.Default
    private List<String> themes = new ArrayList<>();
}