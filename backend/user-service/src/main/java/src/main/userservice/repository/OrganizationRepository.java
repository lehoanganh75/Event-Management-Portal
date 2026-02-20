package src.main.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.userservice.entity.Organization;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization,String> {
}
