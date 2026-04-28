package com.eventservice.repository;

import com.eventservice.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
    List<Organization> findByIsDeletedFalse();
    long countByIsDeletedFalse();
    List<Organization> findByOwnerAccountIdAndIsDeletedFalse(String ownerAccountId);
}
