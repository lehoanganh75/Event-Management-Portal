package src.main.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.identityservice.entity.User;
import src.main.identityservice.repository.UserRepository;
import src.main.identityservice.service.UserService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public User getProfileByUserId(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + userId));
    }

    @Override
    public User updateProfile(String accountId, User updatedProfile) {
        User userProfile = userRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + accountId));
        userProfile.setFullName(updatedProfile.getFullName());
        userProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        userProfile.setGender(updatedProfile.getGender());
        userProfile.setMajorName(updatedProfile.getMajorName());
        return userRepository.save(userProfile);
    }

    @Override
    public User updateApprovalStatus(String profileId) {
        User userProfile = userRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + profileId));
        return userRepository.save(userProfile);
    }

    @Override
    public String getUserProfileIdByAccountId(String accountId) {
        User profile = userRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return profile.getId();
    }
}
