package com.eventservice.service.impl;

import com.eventservice.dto.NotificationEvent;
import com.eventservice.dto.survey.SurveyDto;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventRegistration;
import com.eventservice.entity.survey.Survey;
import com.eventservice.entity.survey.SurveyQuestion;
import com.eventservice.entity.survey.SurveyResponse;
import com.eventservice.kafka.NotificationProducer;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.survey.SurveyRepository;
import com.eventservice.repository.survey.SurveyResponseRepository;
import com.eventservice.service.SurveyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SurveyServiceImpl implements SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository responseRepository;
    private final EventRepository eventRepository;
    private final NotificationProducer notificationProducer;

    @Override
    @Transactional
    public SurveyDto createOrUpdateSurvey(SurveyDto surveyDto) {
        Survey survey = surveyRepository.findByEventId(surveyDto.getEventId())
                .orElseGet(() -> {
                    Event event = eventRepository.findById(surveyDto.getEventId()).orElseThrow();
                    return Survey.builder().event(event).build();
                });

        survey.setTitle(surveyDto.getTitle());
        survey.setDescription(surveyDto.getDescription());
        
        // Simple mapping for demonstration. In real app, manage questions more carefully.
        if (surveyDto.getQuestions() != null) {
            survey.getQuestions().clear();
            surveyDto.getQuestions().forEach(q -> {
                survey.getQuestions().add(SurveyQuestion.builder()
                        .survey(survey)
                        .questionText(q.getQuestionText())
                        .type(q.getType())
                        .options(q.getOptions())
                        .orderIndex(q.getOrderIndex())
                        .isRequired(q.isRequired())
                        .build());
            });
        }

        Survey saved = surveyRepository.save(survey);
        return mapToDto(saved);
    }

    @Override
    public SurveyDto getSurveyByEvent(String eventId) {
        return surveyRepository.findByEventId(eventId).map(this::mapToDto).orElse(null);
    }

    @Override
    @Transactional
    public void publishSurvey(String surveyId) {
        Survey survey = surveyRepository.findById(surveyId).orElseThrow();
        survey.setPublished(true);
        surveyRepository.save(survey);

        // Notify all participants
        Event event = survey.getEvent();
        List<String> participantIds = event.getRegistrations().stream()
                .map(EventRegistration::getParticipantAccountId)
                .collect(Collectors.toList());

        participantIds.forEach(userId -> {
            NotificationEvent notification = NotificationEvent.builder()
                    .recipientId(userId)
                    .title("Khảo sát sự kiện: " + event.getTitle())
                    .message("Vui lòng dành chút thời gian để thực hiện khảo sát cho sự kiện bạn vừa tham gia.")
                    .type("EVENT_SURVEY")
                    .relatedEntityId(event.getId())
                    .actionUrl("/events/" + event.getId() + "?tab=survey")
                    .build();
            notificationProducer.sendNotification(notification);
        });
    }

    @Override
    @Transactional
    public void submitResponse(String userId, String surveyId, String answersJson) {
        SurveyResponse response = responseRepository.findBySurveyIdAndParticipantAccountId(surveyId, userId)
                .orElse(SurveyResponse.builder()
                        .surveyId(surveyId)
                        .participantAccountId(userId)
                        .build());
        
        response.setAnswers(answersJson);
        responseRepository.save(response);
    }

    @Override
    public List<SurveyResponse> getResponses(String surveyId) {
        return responseRepository.findBySurveyId(surveyId);
    }

    @Override
    public boolean hasUserSubmitted(String userId, String surveyId) {
        return responseRepository.findBySurveyIdAndParticipantAccountId(surveyId, userId).isPresent();
    }

    private SurveyDto mapToDto(Survey survey) {
        return SurveyDto.builder()
                .id(survey.getId())
                .eventId(survey.getEvent().getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .isPublished(survey.isPublished())
                .build();
    }
}
