package src.main.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.identityservice.entity.Organization;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
}
