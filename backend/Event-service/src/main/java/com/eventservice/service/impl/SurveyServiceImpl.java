package com.eventservice.service.impl;

import com.eventservice.dto.engagement.NotificationEventDto;
import com.eventservice.dto.engagement.survey.SurveyDto;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.registration.EventRegistration;
import com.eventservice.entity.engagement.survey.Survey;
import com.eventservice.entity.engagement.survey.SurveyQuestion;
import com.eventservice.entity.engagement.survey.SurveyResponse;
import com.eventservice.kafka.NotificationProducer;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.survey.SurveyRepository;
import com.eventservice.repository.survey.SurveyResponseRepository;
import com.eventservice.service.SurveyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.web.multipart.MultipartFile;

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
            NotificationEventDto notification = NotificationEventDto.builder()
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

    @Override
    @Transactional
    public SurveyDto importSurveyFromWord(String eventId, MultipartFile file) {
        try (InputStream is = file.getInputStream(); XWPFDocument document = new XWPFDocument(is)) {
            String title = "Khảo sát nhập từ Word " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM"));
            String description = "Tự động nhập từ file: " + file.getOriginalFilename();

            Survey survey = surveyRepository.findByEventId(eventId)
                    .orElseGet(() -> {
                        Event event = eventRepository.findById(eventId).orElseThrow();
                        return Survey.builder().event(event).build();
                    });

            survey.setTitle(title);
            survey.setDescription(description);
            survey.setPublished(false);

            List<SurveyQuestion> questions = new ArrayList<>();
            SurveyQuestion currentQuestion = null;
            List<String> currentOptions = new ArrayList<>();
            int questionOrder = 0;

            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText().trim();
                if (text.isEmpty()) continue;

                // Detect Question (Starts with "Câu", "Question", or "1.")
                if (text.toLowerCase().startsWith("câu") || 
                    text.toLowerCase().startsWith("question") || 
                    text.matches("^\\d+[.:\\s].*")) {
                    
                    // Save previous question
                    if (currentQuestion != null) {
                        if (!currentOptions.isEmpty()) {
                            currentQuestion.setType("MULTIPLE_CHOICE");
                            currentQuestion.setOptions(String.join("|", currentOptions));
                        } else {
                            currentQuestion.setType("TEXT");
                        }
                        questions.add(currentQuestion);
                    }

                    // Start new question
                    String cleanContent = text.replaceFirst("^(?i)(câu|question|\\d+)\\s*\\d*[.:\\s]*", "").trim();
                    currentQuestion = SurveyQuestion.builder()
                            .survey(survey)
                            .questionText(cleanContent)
                            .orderIndex(questionOrder++)
                            .isRequired(true)
                            .build();
                    currentOptions = new ArrayList<>();
                } 
                // Detect Options (Starts with A., B., C., D. or A), B)...)
                else if (text.matches("^[A-Da-d][.).\\s].*")) {
                    if (currentQuestion != null) {
                        String optionText = text.replaceFirst("^[A-Da-d][.).\\s]+", "").trim();
                        if (!optionText.isEmpty()) {
                            currentOptions.add(optionText);
                        }
                    }
                }
            }

            // Save last question
            if (currentQuestion != null) {
                if (!currentOptions.isEmpty()) {
                    currentQuestion.setType("MULTIPLE_CHOICE");
                    currentQuestion.setOptions(String.join("|", currentOptions));
                } else {
                    currentQuestion.setType("TEXT");
                }
                questions.add(currentQuestion);
            }

            if (survey.getQuestions() == null) {
                survey.setQuestions(new ArrayList<>());
            } else {
                survey.getQuestions().clear();
            }
            survey.getQuestions().addAll(questions);

            Survey saved = surveyRepository.save(survey);
            return mapToDto(saved);

        } catch (Exception e) {
            log.error("Lỗi khi nhập file Word cho Survey: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi xử lý file Word: " + e.getMessage());
        }
    }

    private SurveyDto mapToDto(Survey survey) {
        return SurveyDto.builder()
                .id(survey.getId())
                .eventId(survey.getEvent().getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .isPublished(survey.isPublished())
                .questions(survey.getQuestions() != null ? survey.getQuestions().stream()
                        .map(q -> com.eventservice.dto.engagement.survey.SurveyQuestionDto.builder()
                                .id(q.getId())
                                .questionText(q.getQuestionText())
                                .type(q.getType())
                                .options(q.getOptions())
                                .orderIndex(q.getOrderIndex())
                                .isRequired(q.isRequired())
                                .build())
                        .collect(Collectors.toList()) : null)
                .build();
    }
}
