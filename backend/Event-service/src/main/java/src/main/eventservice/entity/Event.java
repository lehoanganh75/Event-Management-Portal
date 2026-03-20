package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.entity.enums.EventType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String organizationId;
    private String createdByAccountId;
    private String approvedByAccountId;

    @Column(name = "template_id")
    private String templateId;

    private String title;

    private String description;

    @Column(name = "event_topic", length = 1000)
    private String eventTopic;

    private String coverImage;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationDeadline;

    private String location;
    private String eventMode;

    private int maxParticipants;

    @Enumerated(EnumType.STRING)
    private EventType type;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;

    private String luckyDrawId;

    private boolean finalized = false;
    private boolean archived = false;

    private String faculty;
    private String major;
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventPost> posts;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventFeedback> feedbacks;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventRegistration> registrations;

    private String organizerUnit;

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Recap recap;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventSession> session;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted = false;

    @Transient
    private int registeredCount;

    private String notes;

    private String additionalInfo;

    private String customFieldsJson;
}