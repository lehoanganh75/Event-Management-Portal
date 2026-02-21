package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.Prize;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, String> {
}
