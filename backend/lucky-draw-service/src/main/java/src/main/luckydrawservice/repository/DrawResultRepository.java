package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.DrawResult;

@Repository
public interface DrawResultRepository extends JpaRepository<DrawResult, String> {
    boolean existsByLuckyDrawIdAndWinnerProfileId(String luckyDrawId, String winnerProfileId);
}
