package src.main.userservice.service.impl;

import lombok.*;
import org.springframework.stereotype.*;
import src.main.userservice.dto.UserCreatedEvent;
import src.main.userservice.entity.ApprovalStatus;
import src.main.userservice.entity.UserProfile;
import src.main.userservice.repository.UserProfileRepository;
import src.main.userservice.service.UserProfileService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    private final UserProfileRepository userProfileRepository;

    @Override
    public void createInitialProfile(UserCreatedEvent userCreatedEvent) {
        UserProfile userProfile = new UserProfile();
        userProfile.setAccountId(userCreatedEvent.getAccountId());
        userProfile.setFullName(userCreatedEvent.getFullName());
        userProfile.setGender(userCreatedEvent.getGender());
        userProfile.setDateOfBirth(userCreatedEvent.getDateOfBirth());
        userProfile.setApprovalStatus(ApprovalStatus.Pending);
        userProfileRepository.save(userProfile);
    }

    @Override
    public UserProfile getProfileByAccountId(String accountId) {
        return userProfileRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + accountId));
    }

    @Override
    public UserProfile updateProfile(String accountId, UserProfile updatedProfile) {
        UserProfile userProfile = userProfileRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + accountId));
        userProfile.setFullName(updatedProfile.getFullName());
        userProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        userProfile.setGender(updatedProfile.getGender());
        userProfile.setMajorName(updatedProfile.getMajorName());
        return userProfileRepository.save(userProfile);
    }

    @Override
    public UserProfile updateApprovalStatus(String accountId, ApprovalStatus status) {
        UserProfile userProfile = userProfileRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + accountId));
        userProfile.setApprovalStatus(status);
        return userProfileRepository.save(userProfile);
    }

    @Override
    public String getUserProfileIdByAccountId(String accountId) {
        UserProfile profile = userProfileRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return profile.getId();
    }
}
