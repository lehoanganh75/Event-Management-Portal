package com.eventservice.repository.quiz;

import com.eventservice.entity.engagement.quiz.QuizParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizParticipationRepository extends JpaRepository<QuizParticipation, String> {
    Optional<QuizParticipation> findByQuizIdAndParticipantAccountId(String quizId, String participantAccountId);
    List<QuizParticipation> findByQuizIdOrderByTotalScoreDesc(String quizId);
}
