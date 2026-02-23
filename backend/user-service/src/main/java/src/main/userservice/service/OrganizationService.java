package src.main.userservice.service;

import src.main.userservice.entity.ApprovalStatus;
import src.main.userservice.entity.Organization;
import src.main.userservice.entity.UserProfile;

import java.util.List;

public interface OrganizationService {
    List<Organization> getAllOrganizations();
    Organization createOrganization(Organization org);
    Organization updateOrganization(Organization org);
    List<UserProfile> getPendingApprovals();
}
