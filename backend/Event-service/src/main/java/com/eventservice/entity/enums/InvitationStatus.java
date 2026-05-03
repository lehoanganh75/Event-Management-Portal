package com.eventservice.entity.enums;

public enum InvitationStatus {
    PENDING,   // Đang chờ phản hồi
    ACCEPTED,  // Đã đồng ý (Lúc này code sẽ tự tạo EventOrganizer)
    REJECTED,  // Đã từ chối
    EXPIRED,   // Đã hết hạn (nếu bạn đặt deadline cho lời mời)
    CANCELED   // Người mời đã hủy lời mời trước khi người kia kịp chọn
}
