package src.main.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.authservice.entity.VerificationToken;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, String> {
    Optional<VerificationToken> findByToken(String token);
}
