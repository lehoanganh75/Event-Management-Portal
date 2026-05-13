package com.eventservice.repository.quiz;

import com.eventservice.entity.engagement.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, String> {
    List<Quiz> findByEventId(String eventId);

    @Query("SELECT q FROM Quiz q WHERE LOWER(q.id) LIKE LOWER(CONCAT(:pin, '%'))")
    List<Quiz> findByIdStartingWithIgnoreCase(@Param("pin") String pin);
}
