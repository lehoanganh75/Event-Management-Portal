package src.main.luckydrawservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.entity.EntryStatus;

import java.util.Optional;

@Repository
public interface DrawEntryRepository extends JpaRepository<DrawEntry, String> {
    Optional<DrawEntry> findFirstByLuckyDrawIdAndUserProfileIdAndStatus(
            String luckyDrawId, String userProfileId, EntryStatus status);

    Optional<Object> findByLuckyDrawIdAndUserProfileId(String luckyDrawId, String userProfileId);
}
