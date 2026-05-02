package com.eventservice.entity.core;

import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import com.eventservice.entity.enums.OrganizationType;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;           // Tên đơn vị (vd: Khoa CNTT)
    private String description;    // Mô tả đơn vị
    private String logoUrl;        // Link ảnh đại diện
    private String email;          // Email liên lạc chính thức
    private String phone;          // Số điện thoại
    private String officeLocation; // Văn phòng (vd: Phòng H3.1)

    @Enumerated(EnumType.STRING)
    private OrganizationType type; // FACULTY, CLUB, DEPARTMENT

    private String ownerAccountId; // ID người tạo/quản lý cao nhất (từ Identity Service)

    @CreationTimestamp
    private LocalDateTime createdAt;

    private boolean isDeleted = false;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Event> events; // Danh sách sự kiện thuộc đơn vị này
}
