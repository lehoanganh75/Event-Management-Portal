package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.DrawResult;

@Repository
public interface DrawResultRepository extends JpaRepository<DrawResult, String> {
    boolean existsByLuckyDrawIdAndWinnerProfileId(String luckyDrawId, String winnerProfileId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM DrawResult d WHERE d.luckyDraw.id = :luckyDrawId")
    void deleteByLuckyDrawId(@org.springframework.data.repository.query.Param("luckyDrawId") String luckyDrawId);
}
