package com.eventservice.entity.enums;

public enum PostStatus {
    DRAFT,      // Bản nháp
    PENDING,    // Đang chờ duyệt (Mới thêm)
    PUBLISHED,  // Đã xuất bản/công khai
    REJECTED    // (Tùy chọn) Bị từ chối nếu không đạt yêu cầu
}
