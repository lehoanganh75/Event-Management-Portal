package com.eventservice.service.impl;

import com.eventservice.dto.engagement.quiz.QuizDto;
import com.eventservice.dto.engagement.quiz.QuizEvent;
import com.eventservice.dto.engagement.quiz.QuizSubmissionDto;
import com.eventservice.entity.engagement.quiz.Quiz;
import com.eventservice.entity.engagement.quiz.QuizOption;
import com.eventservice.entity.engagement.quiz.QuizParticipation;
import com.eventservice.entity.engagement.quiz.QuizQuestion;
import com.eventservice.repository.EventRepository;
import com.eventservice.repository.quiz.QuizParticipationRepository;
import com.eventservice.repository.quiz.QuizQuestionRepository;
import com.eventservice.repository.quiz.QuizRepository;
import com.eventservice.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizParticipationRepository participationRepository;
    private final EventRepository eventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public QuizDto createQuiz(QuizDto quizDto) {
        Quiz quiz = Quiz.builder()
                .title(quizDto.getTitle())
                .description(quizDto.getDescription())
                .event(eventRepository.findById(quizDto.getEventId())
                        .orElseThrow(() -> new RuntimeException("Event not found")))
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        if (quizDto.getQuestions() != null) {
            List<QuizQuestion> questions = quizDto.getQuestions().stream().map(qDto -> {
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(savedQuiz)
                        .content(qDto.getContent())
                        .type(qDto.getType())
                        .timeLimit(qDto.getTimeLimit() > 0 ? qDto.getTimeLimit() : 30)
                        .basePoints(qDto.getBasePoints() > 0 ? qDto.getBasePoints() : 100)
                        .hint(qDto.getHint())
                        .correctData(qDto.getCorrectData())
                        .orderIndex(qDto.getOrderIndex())
                        .build();

                if (qDto.getOptions() != null) {
                    List<QuizOption> options = qDto.getOptions().stream().map(oDto -> QuizOption.builder()
                            .question(question)
                            .content(oDto.getContent())
                            .isCorrect(oDto.isCorrect())
                            .matchingKey(oDto.getMatchingKey())
                            .build()).collect(Collectors.toList());
                    question.setOptions(options);
                }
                return question;
            }).collect(Collectors.toList());

            questionRepository.saveAll(questions);
            savedQuiz.setQuestions(questions);
        }

        return mapToDto(savedQuiz);
    }

    @Override
    public QuizDto getQuiz(String quizId) {
        return quizRepository.findById(quizId).map(this::mapToDto).orElseThrow();
    }

    @Override
    public List<QuizDto> getQuizzesByEvent(String eventId) {
        return quizRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void startQuiz(String quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        quiz.setActive(true);
        quizRepository.save(quiz);

        broadcastEvent(quiz.getEvent().getId(), "START", quizId);
    }

    @Override
    @Transactional
    public void nextQuestion(String quizId, int questionIndex) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        List<QuizQuestion> questions = quiz.getQuestions();
        log.info("[Quiz] nextQuestion: quizId={}, index={}, totalQuestions={}", quizId, questionIndex,
                questions.size());

        if (questions.isEmpty()) {
            log.warn("[Quiz] No questions found for quiz: {}. Load from repository instead.", quizId);
            // Fallback: query questions directly
            List<QuizQuestion> directQuestions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);
            log.info("[Quiz] Direct query found {} questions", directQuestions.size());
            if (!directQuestions.isEmpty() && questionIndex < directQuestions.size()) {
                broadcastEvent(quiz.getEvent().getId(), "NEXT_QUESTION", directQuestions.get(questionIndex));
            } else {
                broadcastEvent(quiz.getEvent().getId(), "END", quizId);
            }
            return;
        }

        if (questionIndex < questions.size()) {
            QuizQuestion question = questions.get(questionIndex);
            broadcastEvent(quiz.getEvent().getId(), "NEXT_QUESTION", question);
        } else {
            // No more questions - end the quiz
            quiz.setActive(false);
            quizRepository.save(quiz);
            broadcastEvent(quiz.getEvent().getId(), "END", quizId);
        }
    }

    @Override
    @Transactional
    public void endQuiz(String quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        quiz.setActive(false);
        quizRepository.save(quiz);

        broadcastEvent(quiz.getEvent().getId(), "END", quizId);
    }

    @Override
    @Transactional
    public int submitAnswer(String userId, QuizSubmissionDto submission) {
        QuizQuestion question = questionRepository.findById(submission.getQuestionId()).orElseThrow();

        boolean isCorrect = checkAnswer(question, submission.getAnswer());
        int points = 0;

        if (isCorrect) {
            // Speed-based scoring: Max points if 0s, 50% points if at timeLimit
            double timeRatio = submission.getResponseTime() / question.getTimeLimit();
            double factor = Math.max(0.5, 1.0 - (timeRatio * 0.5));
            points = (int) (question.getBasePoints() * factor);

            QuizParticipation participation = participationRepository.findByQuizIdAndParticipantAccountId(
                    submission.getQuizId(), userId).orElseGet(() -> {
                        // In real app, fetch user details from identity-service
                        return QuizParticipation.builder()
                                .quizId(submission.getQuizId())
                                .participantAccountId(userId)
                                .fullName("Student " + userId.substring(0, 4))
                                .totalScore(0)
                                .build();
                    });

            participation.setTotalScore(participation.getTotalScore() + points);
            participationRepository.save(participation);

            // Broadcast leaderboard update (Duck Race)
            broadcastLeaderboard(submission.getQuizId(), question.getQuiz().getEvent().getId());
        }

        return points;
    }

    @Override
    public List<QuizParticipation> getLeaderboard(String quizId) {
        return participationRepository.findByQuizIdOrderByTotalScoreDesc(quizId);
    }

    @Override
    @Transactional
    public QuizDto importQuizFromWord(String eventId, MultipartFile file) {
        try (InputStream is = file.getInputStream();
                XWPFDocument document = new XWPFDocument(is)) {

            String title = "Thử thách nhập từ Word "
                    + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM"));
            String description = "Tự động nhập từ file: " + file.getOriginalFilename();

            Quiz quiz = Quiz.builder()
                    .title(title)
                    .description(description)
                    .event(eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found")))
                    .build();
            Quiz savedQuiz = quizRepository.save(quiz);

            List<QuizQuestion> questions = new ArrayList<>();
            QuizQuestion currentQuestion = null;
            List<QuizOption> currentOptions = new ArrayList<>();
            int questionOrder = 0;

            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText().trim();
                if (text.isEmpty())
                    continue;

                // Detect Question (Starts with "Câu", "Question", or "1.")
                if (text.toLowerCase().startsWith("câu") ||
                        text.toLowerCase().startsWith("question") ||
                        text.matches("^\\d+[.:].*")) {

                    // Save previous question
                    if (currentQuestion != null && !currentOptions.isEmpty()) {
                        currentQuestion.setOptions(new ArrayList<>(currentOptions));
                        questions.add(currentQuestion);
                    }

                    // Start new question
                    String cleanContent = text.replaceFirst("^(?i)(Câu|Question|\\d+)\\s*\\d*[.:]\\s*", "");
                    currentQuestion = QuizQuestion.builder()
                            .quiz(savedQuiz)
                            .content(cleanContent)
                            .type(com.eventservice.entity.engagement.quiz.QuestionType.MULTIPLE_CHOICE)
                            .timeLimit(30)
                            .basePoints(100)
                            .orderIndex(questionOrder++)
                            .build();
                    currentOptions = new ArrayList<>();
                }
                // Detect Option (Starts with "A.", "B.", or "*A.")
                else if (text.matches("^[A-Da-d][.:].*") || text.matches("^\\*[A-Da-d][.:].*")) {
                    if (currentQuestion == null)
                        continue;

                    boolean isCorrect = text.startsWith("*");
                    String optionContent = text.replaceFirst("^\\*?\\s*[A-Da-d][.:]\\s*", "").trim();

                    currentOptions.add(QuizOption.builder()
                            .question(currentQuestion)
                            .content(optionContent)
                            .isCorrect(isCorrect)
                            .build());
                }
            }

            // Add final question
            if (currentQuestion != null && !currentOptions.isEmpty()) {
                currentQuestion.setOptions(currentOptions);
                questions.add(currentQuestion);
            }

            if (!questions.isEmpty()) {
                questionRepository.saveAll(questions);
                savedQuiz.setQuestions(questions);
            }

            return mapToDto(savedQuiz);

        } catch (Exception e) {
            log.error("Lỗi khi nhập Quiz từ file Word", e);
            throw new RuntimeException("Không thể đọc file Word: " + e.getMessage());
        }
    }

    private boolean checkAnswer(QuizQuestion question, String answer) {
        // Implement logic for different types
        switch (question.getType()) {
            case MULTIPLE_CHOICE:
                return question.getOptions().stream()
                        .anyMatch(o -> o.isCorrect() && o.getId().equals(answer));
            case WORD_SCRAMBLE:
            case MATCHING:
                return question.getCorrectData().equalsIgnoreCase(answer);
            default:
                return false;
        }
    }

    private void broadcastEvent(String eventId, String type, Object data) {
        QuizEvent event = QuizEvent.builder()
                .eventId(eventId)
                .type(type)
                .data(data)
                .build();
        kafkaTemplate.send("quiz-topic", event);
    }

    private void broadcastLeaderboard(String quizId, String eventId) {
        List<QuizParticipation> leaderboard = getLeaderboard(quizId);
        broadcastEvent(eventId, "LEADERBOARD", leaderboard);
    }

    private QuizDto mapToDto(Quiz quiz) {
        if (quiz == null)
            return null;
        return QuizDto.builder()
                .id(quiz.getId())
                .eventId(quiz.getEvent() != null ? quiz.getEvent().getId() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .isActive(quiz.isActive())
                .questions(quiz.getQuestions() != null ? quiz.getQuestions().stream()
                        .map(com.eventservice.dto.engagement.quiz.QuestionDto::from)
                        .collect(Collectors.toList()) : null)
                .build();
    }
}
