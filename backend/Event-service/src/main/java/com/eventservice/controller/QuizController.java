package com.eventservice.controller;

import com.eventservice.dto.engagement.quiz.QuizDto;
import com.eventservice.dto.engagement.quiz.QuizSubmissionDto;
import com.eventservice.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizDto> createQuiz(@RequestBody QuizDto quizDto) {
        return ResponseEntity.ok(quizService.createQuiz(quizDto));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<QuizDto>> getQuizzesByEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(quizService.getQuizzesByEvent(eventId));
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<Void> startQuiz(@PathVariable String quizId) {
        quizService.startQuiz(quizId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{quizId}/next")
    public ResponseEntity<Void> nextQuestion(@PathVariable String quizId, @RequestParam int index) {
        quizService.nextQuestion(quizId, index);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Integer>> submitAnswer(
            @RequestBody QuizSubmissionDto submission,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        int points = quizService.submitAnswer(userId, submission);
        return ResponseEntity.ok(Map.of("points", points));
    }

    @GetMapping("/{quizId}/leaderboard")
    public ResponseEntity<List<?>> getLeaderboard(@PathVariable String quizId) {
        return ResponseEntity.ok(quizService.getLeaderboard(quizId));
    }

    @PostMapping("/import/{eventId}")
    public ResponseEntity<QuizDto> importQuiz(@PathVariable String eventId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(quizService.importQuizFromWord(eventId, file));
    }
}
