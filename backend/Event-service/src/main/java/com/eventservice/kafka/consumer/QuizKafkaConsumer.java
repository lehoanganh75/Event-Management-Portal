package com.eventservice.kafka.consumer;

import com.eventservice.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizKafkaConsumer {

    private final QuizService quizService;

    @KafkaListener(topics = "quiz-join-topic", groupId = "quiz-group")
    public void consumeQuizJoin(Map<String, Object> payload) {
        log.info("#### [KAFKA] Received join request: {}", payload);
        
        String quizId = (String) payload.get("quizId");
        String nickname = (String) payload.get("nickname");
        String avatar = (String) payload.get("avatar");
        String userId = (String) payload.get("userId");
        
        try {
            quizService.joinQuiz(quizId, nickname, avatar, userId);
            log.info("#### [KAFKA] Successfully processed join for: {}", nickname);
        } catch (Exception e) {
            log.error("#### [KAFKA] Failed to process join: {}", e.getMessage());
        }
    }
}
