package src.main.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.identityservice.entity.MembershipStatus;
import src.main.identityservice.entity.Organization;
import src.main.identityservice.service.OrganizationService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {
    @Override
    public List<Organization> getAllOrganizations() {
        return List.of();
    }

    @Override
    public Organization createOrganization(Organization org) {
        return null;
    }

    @Override
    public Organization updateOrganization(Organization org) {
        return null;
    }

    @Override
    public List<MembershipStatus> getPendingApprovals() {
        return List.of();
    }
}
