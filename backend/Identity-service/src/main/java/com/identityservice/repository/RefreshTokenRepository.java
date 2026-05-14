package com.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.identityservice.entity.RefreshToken;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE RefreshToken r SET r.revoked = true, r.used = true WHERE r.token = :token AND r.revoked = false AND r.used = false")
    int revokeToken(String token);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE RefreshToken r SET r.used = true WHERE r.token = :token AND r.used = false")
    int markTokenAsUsed(String token);
}
