package src.main.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.authservice.entity.Account;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,String> {
    Optional<Object> findByUsername(String username);
    Optional<Object> findByEmail(String email);
}
