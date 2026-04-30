package com.eventservice.dto.engagement;

import com.eventservice.dto.core.request.*;
import com.eventservice.dto.core.response.*;
import com.eventservice.dto.registration.request.*;
import com.eventservice.dto.registration.response.*;
import com.eventservice.dto.social.request.*;
import com.eventservice.dto.social.response.*;
import com.eventservice.dto.plan.request.*;
import com.eventservice.dto.plan.response.*;
import com.eventservice.dto.user.*;
import com.eventservice.dto.engagement.*;
import com.eventservice.dto.engagement.quiz.*;
import com.eventservice.dto.engagement.survey.*;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEventDto {
    private String recipientId;   // UserProfileId của người nhận
    private String senderId;      // ID người gửi (Trưởng ban)
    private String title;
    private String message;
    private String type;          // e.g., "INVITATION", "REMINDER"
    private String relatedEntityId; // ID của lời mời hoặc sự kiện
    private String actionUrl;     // Link để nhấn vào xem chi tiết
}

