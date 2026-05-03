package com.eventservice.entity.enums;

public enum ChatSessionStatus {
    ACTIVE, // Chat đang diễn ra
    ENDED, // Chat đã kết thúc
    ARCHIVED, // Chat đã lưu trữ
    CONVERTED // Guest đã chuyển thành user đăng ký
}
