package com.eventservice.controller;

import com.eventservice.dto.AIPlanningRequest;
import com.eventservice.dto.ApiResponse;
import com.eventservice.dto.EventPlanSuggestion;
import com.eventservice.entity.template.EventTemplate;
import com.eventservice.repository.EventTemplateRepository;
import com.eventservice.service.GeminiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai-planning")
@RequiredArgsConstructor
@Slf4j
public class AIPlanningController {

    private final GeminiChatService geminiChatService;
    private final EventTemplateRepository templateRepository;

    /**
     * Generate plan from a selected template and user context
     */
    @PostMapping("/from-template")
    public ResponseEntity<ApiResponse<EventPlanSuggestion>> generateFromTemplate(
            @RequestBody AIPlanningRequest request
    ) {
        log.info("Generating AI plan from template ID: {}", request.getTemplateId());

        EventTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new RuntimeException("Template not found"));

        EventPlanSuggestion suggestion = geminiChatService.generatePlanFromTemplate(
                template.getTemplateName(),
                template.getDescription(),
                request.getUserContext()
        );

        return ResponseEntity.ok(ApiResponse.<EventPlanSuggestion>builder()
                .code(1000)
                .message("Plan generated from template successfully")
                .result(suggestion)
                .build());
    }

    /**
     * Generate plan from raw text
     */
    @PostMapping("/from-raw-text")
    public ResponseEntity<ApiResponse<EventPlanSuggestion>> generateFromRawText(
            @RequestBody AIPlanningRequest request
    ) {
        log.info("Generating AI plan from raw text. Length: {}",
                request.getRawText() != null ? request.getRawText().length() : 0);

        EventPlanSuggestion suggestion = geminiChatService.extractEventDetails(request.getRawText());

        return ResponseEntity.ok(ApiResponse.<EventPlanSuggestion>builder()
                .code(1000)
                .message("Plan generated from raw text successfully")
                .result(suggestion)
                .build());
    }
}
