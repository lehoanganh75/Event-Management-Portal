package src.main.userservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.userservice.repository.OrganizationRepository;
import src.main.userservice.repository.UserProfileRepository;
import src.main.userservice.service.UserProfileService;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;
}
