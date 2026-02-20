package src.main.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.userservice.entity.UserProfile;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile,String> {
    Optional<UserProfile> findByAccountId(String accountId);
    List<UserProfile> findByOrganizationId(String orgId);
}
