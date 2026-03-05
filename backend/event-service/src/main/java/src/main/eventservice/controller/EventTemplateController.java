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
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return ResponseEntity.ok(templateService.getAllTemplates(organizationId, search, pageable));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Event> applyTemplate(@PathVariable String id, @RequestParam String accountId) {
        return ResponseEntity.ok(templateService.createFromTemplate(id, accountId));
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