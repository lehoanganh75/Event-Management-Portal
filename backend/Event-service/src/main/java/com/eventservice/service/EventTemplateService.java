package com.eventservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventTemplate;

import java.util.List;

public interface EventTemplateService {
    Event createFromTemplate(String templateId, String accountId);

    EventTemplate saveTemplate(EventTemplate template);

    List<EventTemplate> getAllTemplatesByOrg(String organizationId);

    EventTemplate updateTemplate(String id, EventTemplate details);

    void deleteTemplate(String id);

    Page<EventTemplate> getAllTemplates(String orgId, String search, Pageable pageable);

    EventTemplate getTemplateById(String id);

    Page<EventTemplate> getAllTemplatesGlobal(String search, Pageable pageable);
}
