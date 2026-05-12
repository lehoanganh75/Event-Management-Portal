package com.notificationservice.controller;

import com.notificationservice.dto.QuizJoinRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class QuizWebSocketController {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @MessageMapping("/quiz.join/{quizId}")
    public void joinQuiz(@DestinationVariable String quizId, @Payload QuizJoinRequest request) {
        log.info("#### [WS] Received join request for Quiz: {}, Nickname: {}", quizId, request.getNickname());
        
        // Wrap for Kafka
        Map<String, Object> payload = new HashMap<>();
        payload.put("quizId", quizId);
        payload.put("nickname", request.getNickname());
        payload.put("avatar", request.getAvatar());
        payload.put("userId", request.getUserId());
        
        kafkaTemplate.send("quiz-join-topic", payload);
        log.info("#### [WS] Dispatched join request to Kafka topic: quiz-join-topic");
    }
}
