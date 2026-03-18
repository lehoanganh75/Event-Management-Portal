package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
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
    private EventStatus status;

    private boolean hasLuckyDraw;
    private boolean finalized;
    private boolean archived;

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

    @ElementCollection
    private List<String> participants = new ArrayList<>();

    private String organizerUnit;

    @ElementCollection
    private List<String> recipients = new ArrayList<>();

    @ElementCollection
    private List<String> customRecipients = new ArrayList<>();

    @ElementCollection
    private List<String> presenters = new ArrayList<>();

    @ElementCollection
    private List<String> organizingCommittee = new ArrayList<>();

    @ElementCollection
    private List<String> attendees = new ArrayList<>();

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Recap recap;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EventSession> session;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Transient
    private int registeredCount;

    private String notes;

    private String additionalInfo;

    private String customFieldsJson;
}