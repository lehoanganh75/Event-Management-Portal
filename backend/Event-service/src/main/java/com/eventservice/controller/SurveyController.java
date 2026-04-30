package com.eventservice.controller;

import com.eventservice.dto.engagement.survey.SurveyDto;
import com.eventservice.service.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping
    public ResponseEntity<SurveyDto> createOrUpdate(@RequestBody SurveyDto surveyDto) {
        return ResponseEntity.ok(surveyService.createOrUpdateSurvey(surveyDto));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<SurveyDto> getByEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(surveyService.getSurveyByEvent(eventId));
    }

    @PostMapping("/{surveyId}/publish")
    public ResponseEntity<Void> publish(@PathVariable String surveyId) {
        surveyService.publishSurvey(surveyId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{surveyId}/submit")
    public ResponseEntity<Void> submitResponse(
            @PathVariable String surveyId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        surveyService.submitResponse(userId, surveyId, body.get("answers"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{surveyId}/has-submitted")
    public ResponseEntity<Map<String, Boolean>> hasSubmitted(
            @PathVariable String surveyId,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(Map.of("submitted", surveyService.hasUserSubmitted(userId, surveyId)));
    }

    @PostMapping("/import/{eventId}")
    public ResponseEntity<SurveyDto> importSurvey(@PathVariable String eventId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(surveyService.importSurveyFromWord(eventId, file));
    }
}
