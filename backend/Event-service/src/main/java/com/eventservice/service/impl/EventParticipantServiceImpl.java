package com.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventParticipant;
import com.eventservice.entity.enums.ParticipationStatus;
import com.eventservice.repository.EventParticipantRepository;
import com.eventservice.repository.EventRepository;
import com.eventservice.service.EventParticipantService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventParticipantServiceImpl implements EventParticipantService {

    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    @Transactional
    @Override
    public EventParticipant registerParticipant(String eventId, EventParticipant participant) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + eventId));

        boolean exists = participantRepository.existsByEventIdAndEmail(eventId, participant.getEmail());
        if (exists) {
            throw new RuntimeException("Email đã đăng ký tham gia sự kiện này");
        }

        participant.setEvent(event);
        participant.setStatus(ParticipationStatus.REGISTERED);
//        participant.setRegisteredAt(LocalDateTime.now());
        return participantRepository.save(participant);
    }

    @Override
    public List<EventParticipant> getParticipants(String eventId) {
        return participantRepository.findByEventId(eventId);
    }

    @Override
    public List<EventParticipant> getParticipantsByStatus(String eventId, ParticipationStatus status) {
        return participantRepository.findByEventIdAndStatus(eventId, status);
    }

    @Transactional
    @Override
    public void cancelParticipant(String participantId, String reason) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người tham gia với ID: " + participantId));
        participant.setStatus(ParticipationStatus.CANCELLED);
        participant.setNotes(reason);
        participantRepository.save(participant);
    }

    @Transactional
    @Override
    public void checkInParticipant(String participantId, String checkedInBy) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người tham gia với ID: " + participantId));
        participant.setCheckedIn(true);
        participant.setAttendedAt(LocalDateTime.now());
        participant.setStatus(ParticipationStatus.ATTENDED);
//        participant.setCheckedInBy(checkedInBy);
        participantRepository.save(participant);
    }

    @Override
    public long countParticipantsByEventId(String eventId) {
        return participantRepository.countByEventId(eventId);
    }

    @Override
    public long countParticipantsByEventIdAndStatus(String eventId, ParticipationStatus status) {
        return participantRepository.countByEventIdAndStatus(eventId, status);
    }
}