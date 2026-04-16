package com.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventOrganizer;
import com.eventservice.entity.EventTemplate;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.EventTemplateRepository;
import com.eventservice.service.EventTemplateService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventTemplateServiceImpl implements EventTemplateService {
    private final EventTemplateRepository templateRepository;
    private final EventRepository eventRepository;

    @Override
    public List<EventTemplate> getAllTemplates() {
        return  templateRepository.findAll();
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

        Event event = new Event();

        event.setTitle(template.getDefaultTitle() != null ? template.getDefaultTitle() : "Untitled Event");
        event.setCoverImage(template.getDefaultCoverImage());
        event.setLocation(template.getDefaultLocation());
        event.setEventMode(template.getDefaultEventMode());
        event.setMaxParticipants(template.getDefaultMaxParticipants() > 0 ? template.getDefaultMaxParticipants() : 100);

//        event.setFaculty(template.getFaculty());
//        event.setMajor(template.getMajor());

        EventOrganizer eventOrganizer = new EventOrganizer();
//        eventOrganizer.setId(template.getOrganizationId());
//        event.setEventOrganizer(eventOrganizer);

        event.setCreatedByAccountId(accountId);

        event.setStatus(EventStatus.DRAFT);
        event.setFinalized(false);
        event.setArchived(false);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());

        return eventRepository.save(event);
    }

    @Override
    public EventTemplate saveTemplate(EventTemplate template) {
        if (template.getThemes() == null) {
            template.setThemes(new ArrayList<>());
        }

        template.setUpdatedAt(LocalDateTime.now());
        return templateRepository.save(template);
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

        template.setFaculty(details.getFaculty());
        template.setMajor(details.getMajor());

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
    public Page<EventTemplate> getAllTemplatesGlobal(String search, Pageable pageable) {
        String searchKeyword = (search == null) ? "" : search;

        Sort sort = Sort.by(Sort.Direction.DESC, "usageCount")
                .and(Sort.by(Sort.Direction.DESC, "createdAt"));

        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );

        return templateRepository.findByTemplateNameContainingIgnoreCase(searchKeyword, sorted);
    }
}