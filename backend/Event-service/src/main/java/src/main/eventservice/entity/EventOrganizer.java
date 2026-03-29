package src.main.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import src.main.eventservice.entity.enums.OrganizerRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_organizers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"event", "hibernateLazyInitializer", "handler"})
public class EventOrganizer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonBackReference
    private Event event;

    private String fullName;
    private String email;

    private String position;
    private String department;

    @Enumerated(EnumType.STRING)
    private OrganizerRole role;

    @CreationTimestamp
    private LocalDateTime assignedAt;
}