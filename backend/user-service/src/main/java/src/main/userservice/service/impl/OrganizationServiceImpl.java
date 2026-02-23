package src.main.userservice.service.impl;

import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.userservice.entity.ApprovalStatus;
import src.main.userservice.entity.Organization;
import src.main.userservice.entity.UserProfile;
import src.main.userservice.repository.OrganizationRepository;
import src.main.userservice.repository.UserProfileRepository;
import src.main.userservice.service.OrganizationService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {
    private final OrganizationRepository orgRepo;
    private final UserProfileRepository userRepo;

    @Override
    @Transactional
    public List<Organization> getAllOrganizations() {
        return orgRepo.findByIsDeleted(false);
    }

    @Override
    public Organization createOrganization(Organization org) {
        return orgRepo.save(org);
    }

    @Override
    public Organization updateOrganization(Organization org) {
        return orgRepo.save(org);
    }

    @Override
    public List<UserProfile> getPendingApprovals() {
        return userRepo.findByApprovalStatus(ApprovalStatus.Pending);
    }
}
