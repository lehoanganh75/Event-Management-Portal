package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.DrawEntry;

@Repository
public interface DrawEntryRepository extends JpaRepository<DrawEntry, String> {
}
