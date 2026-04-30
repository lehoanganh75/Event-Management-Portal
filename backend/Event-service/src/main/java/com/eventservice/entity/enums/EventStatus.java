package com.eventservice.entity.enums;

import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.social.*;
import com.eventservice.entity.engagement.*;
import com.eventservice.entity.engagement.quiz.*;
import com.eventservice.entity.engagement.survey.*;
import com.eventservice.entity.template.*;
import com.eventservice.entity.report.*;

public enum EventStatus {
    DRAFT,                          // Bản nháp, chưa được submit để duyệt
    PLAN_PENDING_APPROVAL,          // Đã submit để duyệt, đang chờ phê duyệt
    PLAN_APPROVED,                  // Đã được phê duyệt, có thể tạo sự kiện từ kế hoạch này
    EVENT_PENDING_APPROVAL,         // Sự kiện đã được tạo từ kế hoạch, đang chờ phê duyệt
    PUBLISHED,                      // Sự kiện đã được phê duyệt và công khai
    ONGOING,                        // Sự kiện đang diễn ra
    COMPLETED,                      // Sự kiện đã kết thúc
    CANCELLED,
    REJECTED,
    CONVERTED // Sự kiện đã bị hủy
}
