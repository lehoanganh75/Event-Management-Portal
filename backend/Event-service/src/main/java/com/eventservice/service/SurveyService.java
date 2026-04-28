package com.eventservice.service;

import com.eventservice.dto.survey.SurveyDto;
import com.eventservice.entity.survey.SurveyResponse;
import java.util.List;

public interface SurveyService {
    SurveyDto createOrUpdateSurvey(SurveyDto surveyDto);
    SurveyDto getSurveyByEvent(String eventId);
    void publishSurvey(String surveyId);
    
    void submitResponse(String userId, String surveyId, String answersJson);
    List<SurveyResponse> getResponses(String surveyId);
    boolean hasUserSubmitted(String userId, String surveyId);
}
