package com.eventservice.entity.engagement;

import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "event_feedbacks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // --- 1. Identification (Sửa theo ý bạn) ---
    @Column(nullable = false)
    private String reviewerAccountId;

    @Column(nullable = false)
    private Integer rating;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String comment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> imageUrls;

    private boolean isAnonymous = false; // Chế độ ẩn danh

    @Column(columnDefinition = "TEXT")
    private String organizerReply; // Phản hồi từ phía Ban tổ chức

    private LocalDateTime repliedAt; // Thời điểm BTC phản hồi

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private boolean isDeleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
}
