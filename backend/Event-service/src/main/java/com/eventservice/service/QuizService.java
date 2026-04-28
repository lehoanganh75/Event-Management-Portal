package com.eventservice.service;

import com.eventservice.dto.quiz.QuizDto;
import com.eventservice.dto.quiz.QuizSubmissionDto;
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
}
