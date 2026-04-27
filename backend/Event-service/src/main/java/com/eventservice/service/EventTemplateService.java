package com.eventservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventTemplate;

import java.util.List;
import java.util.Optional;

public interface EventTemplateService {

    EventTemplate getTemplatesById(String id);

    Event createFromTemplate(String templateId, String accountId);

    EventTemplate saveTemplate(EventTemplate template, String accountId);

    EventTemplate toggleStar(String id, String userId);

    List<EventTemplate> getAllTemplatesByOrg(String organizationId);

    EventTemplate updateTemplate(String id, EventTemplate details);

    void deleteTemplate(String id);

    List<EventTemplate> getAllTemplates();

    Page<EventTemplate> getAllTemplatesGlobal(String search, String userId, Pageable pageable);

    Page<EventTemplate> getAvailableTemplates(String organizationId, String search, String userId, Pageable pageable);
}
