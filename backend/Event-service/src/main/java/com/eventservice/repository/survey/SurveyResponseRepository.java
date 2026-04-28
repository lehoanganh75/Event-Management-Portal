package com.eventservice.repository.survey;

import com.eventservice.entity.survey.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, String> {
    List<SurveyResponse> findBySurveyId(String surveyId);
    Optional<SurveyResponse> findBySurveyIdAndParticipantAccountId(String surveyId, String participantAccountId);
}
