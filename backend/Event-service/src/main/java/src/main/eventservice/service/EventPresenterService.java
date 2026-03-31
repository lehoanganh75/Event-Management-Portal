package src.main.eventservice.service;

import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.entity.EventPresenter;

import java.util.List;

public interface EventPresenterService {
    @Transactional
    EventPresenter addPresenter(String eventId, EventPresenter presenter);

    List<EventPresenter> getPresenters(String eventId);

    @Transactional
    void removePresenter(String presenterId);

    @Transactional
    EventPresenter updatePresenterOrder(String presenterId, Integer orderIndex);

    @Transactional
    EventPresenter updatePresenterTopic(String presenterId, String topic);

    List<EventPresenter> getPresentersBySession(String eventId, String session);

    boolean existsByEventIdAndEmail(String eventId, String email);
}
