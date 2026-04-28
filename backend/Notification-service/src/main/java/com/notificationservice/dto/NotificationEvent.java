package com.notificationservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String recipientId;   // UserProfileId của người nhận
    private String senderId;      // ID người gửi (Trưởng ban)
    private String title;
    private String message;
    private String type;          // e.g., "INVITATION", "REMINDER"
    private String relatedEntityId; // ID của lời mời hoặc sự kiện
    private String actionUrl;     // Link để nhấn vào xem chi tiết
}