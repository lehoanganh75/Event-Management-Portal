package com.eventservice.repository.survey;

import com.eventservice.entity.engagement.survey.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, String> {
    Optional<Survey> findByEventId(String eventId);
}
