package com.eventservice.service;

import com.eventservice.dto.engagement.quiz.QuizDto;
import com.eventservice.dto.engagement.quiz.QuizSubmissionDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface QuizService {
    QuizDto createQuiz(QuizDto quizDto);
    QuizDto getQuiz(String quizId);
    List<QuizDto> getQuizzesByEvent(String eventId);
    
    void startQuiz(String quizId);
    void nextQuestion(String quizId, int questionIndex);
    void endQuiz(String quizId);
    
    int submitAnswer(String userId, QuizSubmissionDto submission);
    
    List<?> getLeaderboard(String quizId);

    QuizDto importQuizFromWord(String eventId, MultipartFile file);
}
