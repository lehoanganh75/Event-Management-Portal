package com.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.identityservice.entity.VerificationToken;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, String> {
    Optional<VerificationToken> findByToken(String token);

    Optional<VerificationToken> findByTokenAndUser_Username(String otp, String username);

    void deleteByUser(com.identityservice.entity.User user);
}
