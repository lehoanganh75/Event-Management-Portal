package src.main.eventservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventTemplate;
import src.main.eventservice.service.EventTemplateService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "http://localhost:5173")
public class EventTemplateController {

    @Autowired
    private EventTemplateService templateService;

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

        sort = sort.and(Sort.by("createdAt").descending());

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(templateService.getAllTemplates(organizationId, search, pageable));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Event> applyTemplate(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "anonymous") String accountId) {
        return ResponseEntity.ok(templateService.createFromTemplate(id, accountId));
    }


    @PostMapping("/save")
    public ResponseEntity<EventTemplate> saveAsNewTemplate(@RequestBody EventTemplate newTemplate) {
        newTemplate.setId(null);
        newTemplate.setUsageCount(0);
        newTemplate.setCreatedAt(LocalDateTime.now());
        newTemplate.setUpdatedAt(LocalDateTime.now());

        EventTemplate saved = templateService.saveTemplate(newTemplate);
        return ResponseEntity.ok(saved);
    }

    @PostMapping
    public ResponseEntity<EventTemplate> createTemplate(@RequestBody EventTemplate template) {
        return ResponseEntity.ok(templateService.saveTemplate(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventTemplate> updateTemplate(@PathVariable String id, @RequestBody EventTemplate details) {
        return ResponseEntity.ok(templateService.updateTemplate(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}