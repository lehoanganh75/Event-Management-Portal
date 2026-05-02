package com.eventservice.service.impl;

import com.eventservice.entity.Event;
import com.eventservice.entity.mongodb.EventVector;
import com.eventservice.repository.mongodb.EventVectorRepository;
import com.eventservice.service.EventEmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventEmbeddingServiceImpl implements EventEmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final EventVectorRepository eventVectorRepository;

    public EventEmbeddingServiceImpl(
            @org.springframework.beans.factory.annotation.Autowired(required = false) EmbeddingModel embeddingModel,
            EventVectorRepository eventVectorRepository) {
        this.embeddingModel = embeddingModel;
        this.eventVectorRepository = eventVectorRepository;
    }

    @Override
    @Async
    public void upsertEventVector(Event event) {
        try {
            // Tạo nội dung văn bản tóm tắt để AI hiểu ngữ nghĩa
            String content = String.format("Sự kiện: %s. Chủ đề: %s. Địa điểm: %s. Mô tả: %s",
                    event.getTitle(),
                    event.getEventTopic() != null ? event.getEventTopic() : "N/A",
                    event.getLocation() != null ? event.getLocation() : "N/A",
                    event.getDescription() != null ? event.getDescription() : "");

            log.info("Đang tạo embedding cho sự kiện: {}", event.getId());
            
            if (embeddingModel == null) {
                log.warn("Bỏ qua tạo Vector cho sự kiện {} vì EmbeddingModel chưa được cấu hình (Thiếu API Key)", event.getId());
                return;
            }

            // Gọi AI để tạo vector
            List<Double> embedding = embeddingModel.embed(content);

            // Lưu vào MongoDB
            EventVector vector = EventVector.builder()
                    .id(event.getId())
                    .content(content)
                    .embedding(embedding)
                    .title(event.getTitle())
                    .slug(event.getSlug())
                    .coverImage(event.getCoverImage())
                    .updatedAt(LocalDateTime.now())
                    .build();

            eventVectorRepository.save(vector);
            log.info("Đã đồng bộ Vector thành công cho sự kiện: {}", event.getId());
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ Vector: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void deleteEventVector(String eventId) {
        eventVectorRepository.deleteById(eventId);
        log.info("Đã xóa Vector của sự kiện: {}", eventId);
    }
}
