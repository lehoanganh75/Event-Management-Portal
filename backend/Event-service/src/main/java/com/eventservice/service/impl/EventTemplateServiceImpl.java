package com.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.people.EventOrganizer;
import com.eventservice.entity.template.EventTemplate;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.EventTemplateRepository;
import com.eventservice.repository.OrganizationRepository;
import com.eventservice.repository.UserStarredTemplateRepository;
import com.eventservice.entity.template.UserStarredTemplate;
import com.eventservice.kafka.NotificationProducer;
import com.eventservice.dto.engagement.NotificationEventDto;
import com.eventservice.service.EventTemplateService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventTemplateServiceImpl implements EventTemplateService {
    private final EventTemplateRepository templateRepository;
    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;
    private final UserStarredTemplateRepository starredTemplateRepository;
    private final NotificationProducer notificationProducer;

    @Override
    public List<EventTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Override
    public EventTemplate getTemplatesById(String id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu với ID: " + id));
    }

    @Override
    public Event createFromTemplate(String templateId, String accountId) {
        if (templateId == null || templateId.isEmpty()) {
            throw new RuntimeException("Template ID không hợp lệ");
        }

        EventTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu với ID: " + templateId));

        template.setUsageCount(template.getUsageCount() + 1);
        templateRepository.save(template);

        // Send real-time notification about usage
        if (accountId != null && !accountId.equals("anonymous")) {
            NotificationEventDto usageNotification = NotificationEventDto.builder()
                    .recipientId(accountId)
                    .title("Đã áp dụng bản mẫu")
                    .message("Bản mẫu \"" + template.getTemplateName() + "\" đã được ghi nhận thêm 1 lượt sử dụng!")
                    .type("GENERAL")
                    .relatedEntityId(template.getId())
                    .actionUrl("/lecturer/templates")
                    .build();
            notificationProducer.sendNotification(usageNotification);
        }

        Event event = new Event();

        event.setTitle(template.getDefaultTitle() != null ? template.getDefaultTitle() : "Untitled Event");
        event.setCoverImage(template.getDefaultCoverImage());
        event.setLocation(template.getDefaultLocation());
        event.setEventMode(template.getDefaultEventMode());
        event.setMaxParticipants(template.getDefaultMaxParticipants() > 0 ? template.getDefaultMaxParticipants() : 100);

        // event.setFaculty(template.getFaculty());
        // event.setMajor(template.getMajor());

        EventOrganizer eventOrganizer = new EventOrganizer();
        // eventOrganizer.setId(template.getOrganizationId());
        // event.setEventOrganizer(eventOrganizer);

        event.setCreatedByAccountId(accountId);

        event.setStatus(EventStatus.DRAFT);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());

        return eventRepository.save(event);
    }

    @Override
    public EventTemplate saveTemplate(EventTemplate template, String accountId) {
        if (template.getThemes() == null) {
            template.setThemes(new ArrayList<>());
        }

        // Kiểm tra organization nếu có
        if (template.getOrganization() != null && template.getOrganization().getId() != null) {
            String orgId = template.getOrganization().getId();
            if (!organizationRepository.existsById(orgId)) {
                // Nếu không tồn tại org, set về null để tránh lỗi FK
                template.setOrganization(null);
                template.setPublic(true); // Nếu không có org thì mặc định là công khai
            }
        } else {
            template.setPublic(true); // Nếu không chọn org thì mặc định là công khai
        }

        if (accountId != null && !accountId.equals("anonymous")) {
            template.setCreatedByAccountId(accountId);
        }

        template.setUpdatedAt(LocalDateTime.now());
        EventTemplate saved = templateRepository.save(template);

        // Gửi thông báo real-time qua Kafka
        if (accountId != null && !accountId.equals("anonymous")) {
            NotificationEventDto event = NotificationEventDto.builder()
                    .recipientId(accountId)
                    .title("Đã lưu bản mẫu mới")
                    .message("Bạn đã tạo bản mẫu \"" + saved.getTemplateName() + "\" thành công!")
                    .type("GENERAL")
                    .relatedEntityId(saved.getId())
                    .actionUrl("/lecturer/templates") // Hoặc link phù hợp
                    .build();
            notificationProducer.sendNotification(event);
        }

        return saved;
    }

    @Override
    public List<EventTemplate> getAllTemplatesByOrg(String organizationId) {
        return templateRepository.findByOrganizationId(organizationId);
    }

    @Override
    public EventTemplate updateTemplate(String id, EventTemplate details) {
        EventTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mẫu để cập nhật"));

        template.setTemplateName(details.getTemplateName());
        template.setTemplateType(details.getTemplateType());
        template.setCustomTemplateType(details.getCustomTemplateType());
        template.setDescription(details.getDescription());
        template.setDefaultTitle(details.getDefaultTitle());
        template.setDefaultCoverImage(details.getDefaultCoverImage());
        template.setDefaultLocation(details.getDefaultLocation());
        template.setDefaultEventMode(details.getDefaultEventMode());
        template.setDefaultMaxParticipants(details.getDefaultMaxParticipants());

        template.getThemes().clear();
        if (details.getThemes() != null) {
            template.getThemes().addAll(details.getThemes());
        }

        template.setUpdatedAt(LocalDateTime.now());

        return templateRepository.save(template);
    }

    @Override
    public void deleteTemplate(String id) {
        templateRepository.deleteById(id);
    }

    @Override
    @Transactional
    public EventTemplate toggleStar(String id, String userId) {
        System.out.println(">>> [DEBUG] toggleStar - ID: " + id + ", UserID: [" + userId + "]");
        EventTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu với ID: " + id));

        Optional<UserStarredTemplate> existing = starredTemplateRepository.findByUserIdAndTemplateId(userId, id);

        if (existing.isPresent()) {
            System.out.println(">>> [DEBUG] Found existing star, deleting it...");
            starredTemplateRepository.delete(existing.get());
            template.setStarred(false);
        } else {
            System.out.println(">>> [DEBUG] No existing star, creating new one...");
            starredTemplateRepository.save(UserStarredTemplate.builder()
                    .userId(userId)
                    .templateId(id)
                    .build());
            template.setStarred(true);
        }
        
        // Final verification check
        boolean existsAfter = starredTemplateRepository.existsByUserIdAndTemplateId(userId, id);
        System.out.println(">>> [DEBUG] Star exists in DB after operation? " + existsAfter);

        return template;
    }

    @Override
    public Page<EventTemplate> getAllTemplatesGlobal(String search, String userId, Pageable pageable) {
        System.out.println(">>> [STAR-DEBUG] getAllTemplatesGlobal - UserID: [" + userId + "]");
        String searchKeyword = (search == null) ? "" : search;
        Page<EventTemplate> templates = templateRepository.findGlobalTemplates(searchKeyword, userId, pageable);
        
        List<String> starredIds = starredTemplateRepository.findTemplateIdsByUserId(userId);
        System.out.println(">>> [STAR-DEBUG] User has " + starredIds.size() + " starred templates: " + starredIds);
        
        templates.getContent().forEach(t -> {
            boolean isStarred = starredIds.contains(t.getId());
            if (isStarred) {
                System.out.println(">>> [STAR-DEBUG] Marking template " + t.getId() + " as isStarred=true");
            }
            t.setStarred(isStarred);
        });
        return templates;
    }

    @Override
    public Page<EventTemplate> getAvailableTemplates(String organizationId, String search, String userId, Pageable pageable) {
        System.out.println(">>> [STAR-DEBUG] getAvailableTemplates - Org: " + organizationId + ", UserID: [" + userId + "]");
        String searchKeyword = (search == null) ? "" : search;
        Page<EventTemplate> templates = templateRepository.findAvailableTemplates(organizationId, searchKeyword, userId, pageable);
        
        List<String> starredIds = starredTemplateRepository.findTemplateIdsByUserId(userId);
        
        templates.getContent().forEach(t -> {
            boolean isStarred = starredIds.contains(t.getId());
            t.setStarred(isStarred);
        });
        return templates;
    }

    @Override
    @Transactional
    public void incrementUsageCount(String templateId) {
        EventTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu với ID: " + templateId));
        template.setUsageCount(template.getUsageCount() + 1);
        templateRepository.save(template);
    }
}
