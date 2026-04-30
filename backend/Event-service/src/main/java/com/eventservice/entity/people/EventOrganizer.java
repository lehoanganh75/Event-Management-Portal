package com.eventservice.entity.people;

import com.eventservice.entity.core.*;
import com.eventservice.entity.enums.OrganizerStatus;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.eventservice.entity.enums.OrganizerRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_organizers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventOrganizer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String accountId;      // ID người dùng (từ Identity Service)

    @Enumerated(EnumType.STRING)
    private OrganizerRole role;    // LEADER, COORDINATOR, MEMBER, ADVISOR

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private OrganizerStatus status = OrganizerStatus.ACTIVE;

    private boolean isDeleted = false; // Cờ đánh dấu đã xóa (soft delete)

    private String addedByAccountId; // ID của người đã mời/thêm người này (Dùng cho phân quyền hiển thị)

    @CreationTimestamp
    private LocalDateTime assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private Organization organization; // Đơn vị mà nhân sự này thuộc về (Vd: CLB HIT)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}
