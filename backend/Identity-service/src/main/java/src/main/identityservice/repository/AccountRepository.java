package src.main.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import src.main.identityservice.entity.Account;
import src.main.identityservice.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,String> {
    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);
    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.userProfile")
    List<Account> findAllWithProfile();
}
