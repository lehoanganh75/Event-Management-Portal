package src.main.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.authservice.entity.RefreshToken;

import java.util.List;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,String> {
    List<RefreshToken> findAll();
}
