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

public enum ChatSessionStatus {
    ACTIVE,      // Chat đang diễn ra
    ENDED,       // Chat đã kết thúc
    ARCHIVED,    // Chat đã lưu trữ
    CONVERTED    // Guest đã chuyển thành user đăng ký
}
