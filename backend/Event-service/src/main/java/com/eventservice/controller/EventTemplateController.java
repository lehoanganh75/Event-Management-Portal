package com.eventservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.net.URI;
import java.util.List;

import com.eventservice.service.impl.TemplateRecommendationService;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
@Slf4j
public class EventTemplateController {
    private final EventTemplateService templateService;
    private final TemplateRecommendationService recommendationService;

    @PostMapping("/recommend")
    public ResponseEntity<List<EventTemplate>> recommendTemplates(
            @RequestBody String description,
            @RequestParam(defaultValue = "5") int limit) {
        log.info("[RECOMMEND] Request to recommend templates for description length: {}", description.length());
        return ResponseEntity.ok(recommendationService.recommendTemplates(description, limit));
    }

    @GetMapping
    public ResponseEntity<List<EventTemplate>> getTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventTemplate> getTemplatesById(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getTemplatesById(id));
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


    @PostMapping
    public ResponseEntity<EventTemplate> createTemplate(
            @RequestBody EventTemplate template,
            @AuthenticationPrincipal Jwt jwt) {
        
        if (template.getTemplateName() == null || template.getTemplateName().isEmpty()) {
            throw new RuntimeException("Template name không được để trống");
        }

        String accountId = jwt != null ? jwt.getSubject() : "anonymous";
        template.setId(null);
        template.setUsageCount(0);

        EventTemplate saved = templateService.saveTemplate(template, accountId);

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

    @PatchMapping("/{id}/star")
    public ResponseEntity<EventTemplate> toggleStar(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = (jwt != null) ? jwt.getSubject() : "anonymous";
        log.info("[STAR] Request to toggle star for template {} by user {}", id, userId);
        if (jwt != null) {
            log.debug("[STAR] JWT claims: {}", jwt.getClaims());
        }
        return ResponseEntity.ok(templateService.toggleStar(id, userId));
    }

    @GetMapping("/global")
    public ResponseEntity<Page<EventTemplate>> getAllTemplatesGlobal(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "usageCount") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = (jwt != null) ? jwt.getSubject() : "anonymous";
        log.info("[STAR] Request global templates for user {} (search: {})", userId, search);

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(templateService.getAllTemplatesGlobal(search, userId, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<EventTemplate>> getAllAvailableTemplates(
            @RequestParam(required = false) String organizationId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "usageCount") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = (jwt != null) ? jwt.getSubject() : "anonymous";
        log.info("[STAR] Request available templates for user {} (orgId: {}, search: {})", userId, organizationId, search);

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(templateService.getAvailableTemplates(organizationId, search, userId, pageable));
    }

    @PostMapping("/{id}/increment-usage")
    public ResponseEntity<Void> incrementUsageCount(@PathVariable String id) {
        templateService.incrementUsageCount(id);
        return ResponseEntity.ok().build();
    }
}