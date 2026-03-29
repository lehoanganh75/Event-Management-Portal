package src.main.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.eventservice.entity.EventPresenter;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventPresenterRepository extends JpaRepository<EventPresenter, String> {

    List<EventPresenter> findByEventId(String eventId);

//    List<EventPresenter> findByEventIdOrderByOrderIndexAsc(String eventId);

    List<EventPresenter> findByEventIdAndSession(String eventId, String session);

    // Optional<EventPresenter> findByEventIdAndEmail(String eventId, String email);

    // boolean existsByEventIdAndEmail(String eventId, String email);

    void deleteByEventId(String eventId);

    boolean existsByEventIdAndEmail(String eventId, String email);
}