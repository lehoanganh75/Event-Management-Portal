package com.eventservice.controller;

import com.eventservice.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class QuizWebSocketController {

    private final QuizService quizService;

    /**
     * Handles a guest joining the quiz lobby via WebSocket.
     * Frontend publishes to: /app/quiz.join/{quizId}
     */
    @MessageMapping("/quiz.join/{quizId}")
    public void joinQuiz(
            @DestinationVariable String quizId,
            @Payload Map<String, Object> payload) {
        String nickname = (String) payload.get("nickname");
        Object avatarObj = payload.get("avatar");
        String avatar = null;
        if (avatarObj instanceof Map) {
            avatar = (String) ((Map<?, ?>) avatarObj).get("emoji");
        } else if (avatarObj != null) {
            avatar = avatarObj.toString();
        }
        String userId = (String) payload.get("userId");

        log.info("[Quiz WS] Join request: quizId={}, nickname={}, userId={}", quizId, nickname, userId);

        try {
            quizService.joinQuiz(quizId, nickname, avatar, userId);
        } catch (Exception e) {
            log.error("[Quiz WS] Failed to join quiz: {}", e.getMessage());
        }
    }

    @MessageMapping("/quiz.leave/{quizId}")
    public void leaveQuiz(
            @DestinationVariable String quizId,
            @Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        log.info("[Quiz WS] Leave request: quizId={}, userId={}", quizId, userId);
        try {
            quizService.leaveQuiz(quizId, userId);
        } catch (Exception e) {
            log.error("[Quiz WS] Failed to leave quiz: {}", e.getMessage());
        }
    }

    @MessageMapping("/quiz.close/{quizId}")
    public void closeQuiz(@DestinationVariable String quizId) {
        log.info("[Quiz WS] Force close request: quizId={}", quizId);
        try {
            quizService.forceCloseQuiz(quizId);
        } catch (Exception e) {
            log.error("[Quiz WS] Failed to close quiz: {}", e.getMessage());
        }
    }
}
