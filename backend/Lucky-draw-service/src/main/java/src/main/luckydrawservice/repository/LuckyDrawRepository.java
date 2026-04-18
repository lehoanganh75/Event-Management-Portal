package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.LuckyDraw;

import java.util.Optional;

@Repository
public interface LuckyDrawRepository extends JpaRepository<LuckyDraw, String> {
    Optional<LuckyDraw> findByEventId(String eventId);

    Optional<LuckyDraw> findByEventIdAndIsDeletedFalse(String eventId);
}
