package src.main.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.identityservice.entity.OrganizationMember;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, String> {
}
