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

public enum ChatMessageType {
    TEXT,                  // Tin nhắn văn bản thông thường
    SUGGESTION,            // Gợi ý từ AI
    EVENT_PLAN_DRAFT,      // Bản nháp kế hoạch sự kiện
    EVENT_PLAN_TEMPLATE,   // Template sự kiện được đề xuất
    FILE_UPLOAD,           // File đính kèm
    QUICK_REPLY,           // Câu trả lời nhanh
    FORM_DATA              // Dữ liệu form (cho event planning)
}
