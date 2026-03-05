package src.main.eventservice.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventTemplate;
import src.main.eventservice.entity.enums.EventStatus;
import src.main.eventservice.repository.EventTemplateRepository;
import src.main.eventservice.service.EventTemplateService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventTemplateServiceImpl implements EventTemplateService {

    @Autowired
    private EventTemplateRepository templateRepository;

    @Override
    public Event createFromTemplate(String templateId, String accountId) {
        EventTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu với ID: " + templateId));

        Event event = new Event();

        event.setTitle(template.getDefaultTitle());
        event.setDescription(template.getDefaultDescription());
        event.setCoverImage(template.getDefaultCoverImage());
        event.setLocation(template.getDefaultLocation());
        event.setEventMode(template.getDefaultEventMode());
        event.setMaxParticipants(template.getDefaultMaxParticipants());

        event.setOrganizationId(template.getOrganizationId());
        event.setCreatedByAccountId(accountId);

        event.setStatus(EventStatus.Draft);
        event.setFinalized(false);
        event.setArchived(false);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());

        return event;
    }


    @Override
    public Page<EventTemplate> getAllTemplates(String orgId, String search, Pageable pageable) {
        String searchKeyword = (search == null) ? "" : search;

        return templateRepository.findByOrganizationIdAndTemplateNameContainingIgnoreCase(
                orgId,
                searchKeyword,
                pageable
        );
    }
    @Override
    public EventTemplate saveTemplate(EventTemplate template) {
        template.setCreatedAt(LocalDateTime.now());
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
        template.setDefaultTitle(details.getDefaultTitle());
        template.setDefaultDescription(details.getDefaultDescription());
        template.setDefaultLocation(details.getDefaultLocation());
        template.setDefaultEventMode(details.getDefaultEventMode());
        template.setDefaultMaxParticipants(details.getDefaultMaxParticipants());
//        template.setCreatedBy(details.getCreatedBy());
        template.setUpdatedAt(LocalDateTime.now());

        return templateRepository.save(template);
    }

    @Override
    public void deleteTemplate(String id) {
        templateRepository.deleteById(id);
    }
}
