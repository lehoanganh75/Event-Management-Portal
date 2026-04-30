package com.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.identityservice.entity.User;
import com.identityservice.entity.Role;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByUsernameAndIsDeletedFalse(String username);
    boolean existsByUsernameAndIsDeletedFalse(String username);

    Optional<User> findByEmailAndIsDeletedFalse(String email);
    boolean existsByEmailAndIsDeletedFalse(String email);

    @Query("SELECT u.id FROM User u WHERE u.role IN :roles AND u.isDeleted = false")
    List<String> findIdsByRoleIn(List<Role> roles);

    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "u.isDeleted = false")
    List<User> searchUsers(@Param("keyword") String keyword);

    List<User> findAllByEmailInAndIsDeletedFalse(List<String> emails);
    List<User> findAllByIdInAndIsDeletedFalse(List<String> ids);
    List<User> findAllByIsDeletedFalse();
    Optional<User> findByIdAndIsDeletedFalse(String id);
}

