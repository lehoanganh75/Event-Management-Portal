package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.Prize;

import java.util.List;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, String> {
    List<Prize> findByLuckyDrawId(String luckyDrawId);
    List<Prize> findByLuckyDrawIdAndRemainingQuantityGreaterThan(String luckyDrawId, int i);
}
