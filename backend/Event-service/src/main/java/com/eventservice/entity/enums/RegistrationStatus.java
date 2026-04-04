package com.eventservice.entity.enums;

public enum RegistrationStatus {
    REGISTERED,
    CANCELLED,
    ATTENDED,
    PENDING;

    public enum OrganizerRole {
        OWNER,                  // Người tạo sự kiện, có toàn quyền cao nhất
        LEADER,                 // Điều hành chính, duyệt các nội dung
        COORDINATOR,            // Quản lý các tiểu ban, nhân sự
        MEMBER,                 // Hỗ trợ thực hiện các nhiệm vụ được giao
        LOGISTICS,              // Phụ trách cơ sở vật chất, thiết bị
        COMMUNICATION,          // Phụ trách tin bài, hình ảnh
        ADVISOR;                // Giảng viên hoặc chuyên gia hướng dẫn
    }
}
