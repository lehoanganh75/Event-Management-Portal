package src.main.eventservice.service;

import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.entity.EventParticipant;
import src.main.eventservice.entity.enums.ParticipationStatus;

import java.util.List;

public interface EventParticipantService {
    @Transactional
    EventParticipant registerParticipant(String eventId, EventParticipant participant);

    List<EventParticipant> getParticipants(String eventId);

    List<EventParticipant> getParticipantsByStatus(String eventId, ParticipationStatus status);

    @Transactional
    void cancelParticipant(String participantId, String reason);

    @Transactional
    void checkInParticipant(String participantId, String checkedInBy);

    long countParticipantsByEventId(String eventId);

    long countParticipantsByEventIdAndStatus(String eventId, ParticipationStatus status);
}
