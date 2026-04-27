package com.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.identityservice.entity.Account;
import com.identityservice.entity.Role;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.user")
    List<Account> findAllWithProfile();

    @Query("SELECT a.id FROM Account a WHERE a.role IN :roles")
    List<String> findIdsByRoleIn(List<Role> roles);
}
