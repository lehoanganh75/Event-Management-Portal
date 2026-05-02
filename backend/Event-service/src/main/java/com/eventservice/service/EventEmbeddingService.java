package com.eventservice.service;

import com.eventservice.entity.core.Event;

public interface EventEmbeddingService {
    /**
     * Tạo embedding và lưu/cập nhật vào MongoDB Vector Store
     */
    void upsertEventVector(Event event);

    /**
     * Xóa vector khi sự kiện bị xóa
     */
    void deleteEventVector(String eventId);
}
