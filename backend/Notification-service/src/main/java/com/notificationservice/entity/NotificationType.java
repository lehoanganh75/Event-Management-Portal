package com.notificationservice.entity;

public enum NotificationType {
    // Người dùng
    REGISTRATION_CONFIRMED,      // Đăng ký thành công
    CHECKIN_REMINDER,            // Tới hạn điểm danh
    CHECKIN_SUCCESS,             // Điểm danh thành công
    EVENT_STARTING_SOON,         // Sự kiện sắp diễn ra
    EVENT_CANCELLED,             // Sự kiện bị hủy
    EVENT_RESCHEDULED,           // Sự kiện thay đổi lịch
    PARTICIPATION_APPROVED,      // Được duyệt tham gia
    PARTICIPATION_REJECTED,      // Bị từ chối tham gia

    // Admin/BTC
    EVENT_SUBMITTED,             // Gửi phê duyệt sự kiện (đã có)
    NEW_REGISTRATION,            // Có người đăng ký mới
    CHECKIN_NOTIFICATION,        // Điểm danh của người tham gia
    EVENT_FULL,                  // Sự kiện đã đủ số lượng
    APPROVAL_REMINDER,           // Nhắc nhở phê duyệt

    // Superadmin
    EVENT_APPROVED,              // Phê duyệt sự kiện (đã có)
    EVENT_REJECTED,              // Từ chối sự kiện
    USER_REPORT,                 // Báo cáo vi phạm
    ESCALATION_REQUEST,          // Yêu cầu can thiệp

    // Hệ thống
    SYSTEM,                      // Thông báo hệ thống (đã có)
    MAINTENANCE,                 // Bảo trì
    POLICY_UPDATE,                // Cập nhật chính sách

    INVITATION,                   // Lời mời tham gia sự kiện (đã có)
     REMINDER,                     // Nhắc nhở về sự kiện (đã có)
     ANNOUNCEMENT,                  // Thông báo chung (đã có)
}