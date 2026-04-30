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

public enum InvitationStatus {
    PENDING,   // Đang chờ phản hồi
    ACCEPTED,  // Đã đồng ý (Lúc này code sẽ tự tạo EventOrganizer)
    REJECTED,  // Đã từ chối
    EXPIRED,   // Đã hết hạn (nếu bạn đặt deadline cho lời mời)
    CANCELED   // Người mời đã hủy lời mời trước khi người kia kịp chọn
}
