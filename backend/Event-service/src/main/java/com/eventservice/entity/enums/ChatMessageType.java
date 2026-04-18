package com.eventservice.entity.enums;

public enum ChatMessageType {
    TEXT,                  // Tin nhắn văn bản thông thường
    SUGGESTION,            // Gợi ý từ AI
    EVENT_PLAN_DRAFT,      // Bản nháp kế hoạch sự kiện
    EVENT_PLAN_TEMPLATE,   // Template sự kiện được đề xuất
    FILE_UPLOAD,           // File đính kèm
    QUICK_REPLY,           // Câu trả lời nhanh
    FORM_DATA              // Dữ liệu form (cho event planning)
}
