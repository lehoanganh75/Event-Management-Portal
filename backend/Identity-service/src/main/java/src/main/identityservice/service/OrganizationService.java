package src.main.identityservice.service;

import src.main.identityservice.entity.MembershipStatus;
import src.main.identityservice.entity.Organization;

import java.util.List;

public interface OrganizationService {
    List<Organization> getAllOrganizations();
    Organization createOrganization(Organization org);
    Organization updateOrganization(Organization org);
    List<MembershipStatus> getPendingApprovals();
}
