package src.main.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventPresenter;
import src.main.eventservice.repository.EventPresenterRepository;
import src.main.eventservice.repository.EventRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPresenterServiceImpl implements src.main.eventservice.service.EventPresenterService {

    private final EventPresenterRepository presenterRepository;
    private final EventRepository eventRepository;

    @Transactional
    @Override
    public EventPresenter addPresenter(String eventId, EventPresenter presenter) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + eventId));
        presenter.setEvent(event);
        presenter.setAssignedAt(LocalDateTime.now());
        return presenterRepository.save(presenter);
    }

    @Override
    public List<EventPresenter> getPresenters(String eventId) {
        return presenterRepository.findByEventId(eventId);
    }

    @Transactional
    @Override
    public void removePresenter(String presenterId) {
        if (!presenterRepository.existsById(presenterId)) {
            throw new RuntimeException("Không tìm thấy người trình bày với ID: " + presenterId);
        }
        presenterRepository.deleteById(presenterId);
    }

    @Transactional
    @Override
    public EventPresenter updatePresenterOrder(String presenterId, Integer orderIndex) {
        EventPresenter presenter = presenterRepository.findById(presenterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người trình bày với ID: " + presenterId));
        return presenterRepository.save(presenter);
    }

    @Transactional
    @Override
    public EventPresenter updatePresenterTopic(String presenterId, String topic) {
        EventPresenter presenter = presenterRepository.findById(presenterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người trình bày với ID: " + presenterId));
        return presenterRepository.save(presenter);
    }

    @Override
    public List<EventPresenter> getPresentersBySession(String eventId, String session) {
        return presenterRepository.findByEventIdAndSession(eventId, session);
    }

    @Override
    public boolean existsByEventIdAndEmail(String eventId, String email) {
        return presenterRepository.existsByEventIdAndEmail(eventId, email);
    }
}