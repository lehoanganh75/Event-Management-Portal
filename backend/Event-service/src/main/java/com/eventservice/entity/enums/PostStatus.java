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

public enum PostStatus {
    DRAFT,      // Bản nháp
    PENDING,    // Đang chờ duyệt (Mới thêm)
    PUBLISHED,  // Đã xuất bản/công khai
    REJECTED    // (Tùy chọn) Bị từ chối nếu không đạt yêu cầu
}
