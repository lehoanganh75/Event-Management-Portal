package com.eventservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventTemplate;
import com.eventservice.service.EventTemplateService;

import java.net.URI;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class EventTemplateController {
    private final EventTemplateService templateService;

    @GetMapping("/all")
    public ResponseEntity<Page<EventTemplate>> getTemplates(
            @RequestParam String organizationId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "usageCount") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(templateService.getAllTemplates(organizationId, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventTemplate> getTemplate(@PathVariable String id) {
        EventTemplate template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Event> applyTemplate(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "anonymous") String accountId) {

        Event event = templateService.createFromTemplate(id, accountId);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/api/events/{id}")
                .buildAndExpand(event.getId())
                .toUri();

        return ResponseEntity.created(location).body(event);
    }


    @PostMapping("/save")
    public ResponseEntity<EventTemplate> saveAsNewTemplate(@RequestBody EventTemplate newTemplate) {
        newTemplate.setId(null);
        newTemplate.setUsageCount(0);

        EventTemplate saved = templateService.saveTemplate(newTemplate);
        return ResponseEntity.ok(saved);
    }

    @PostMapping
    public ResponseEntity<EventTemplate> createTemplate(@RequestBody EventTemplate template) {
        if (template.getTemplateName() == null || template.getTemplateName().isEmpty()) {
            throw new RuntimeException("Template name không được để trống");
        }

        template.setId(null);
        template.setUsageCount(0);

        EventTemplate saved = templateService.saveTemplate(template);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventTemplate> updateTemplate(
            @PathVariable String id,
            @RequestBody EventTemplate details) {

        EventTemplate updated = templateService.updateTemplate(id, details);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/global")
    public ResponseEntity<Page<EventTemplate>> getAllTemplatesGlobal(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "usageCount") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(templateService.getAllTemplatesGlobal(search, pageable));
    }
}