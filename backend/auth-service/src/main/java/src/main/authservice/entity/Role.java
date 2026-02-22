package src.main.authservice.entity;

public enum Role {
    SUPER_ADMIN,        // Toàn quyền hệ thống (IT Admin)
    ADMIN,              // Quản trị viên điều hành (Duyệt tổ chức, quản lý User)
    ORGANIZER,          // Người đại diện tổ chức (Chủ sở hữu Event)
    CONTENT_MODERATOR,  // Người kiểm duyệt (Duyệt bài đăng, bình luận trong Event)
    FINANCE_MANAGER,    // Quản lý tài chính (Xem doanh thu, duyệt hoàn tiền vé)
    EVENT_STAFF,        // Nhân viên hỗ trợ (Chỉnh sửa Session, quản lý Lucky Draw)
    CHECKIN_STAFF,      // Nhân viên soát vé (Chỉ có quyền quét QR Code)
    EVENT_PARTICIPANT,  // Người tham dự chính thức (Đã mua vé/đăng ký)
    GUEST               // Khách vãng lai (Chỉ xem thông tin công khai)
}
