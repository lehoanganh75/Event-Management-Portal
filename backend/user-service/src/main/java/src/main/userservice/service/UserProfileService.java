package src.main.userservice.service;

import src.main.userservice.dto.UserCreatedEvent;
import src.main.userservice.entity.ApprovalStatus;
import src.main.userservice.entity.UserProfile;

import java.util.List;

public interface UserProfileService {
    void createInitialProfile(UserCreatedEvent userCreatedEvent);
    UserProfile getProfileByAccountId(String accountId);
    UserProfile updateProfile(String accountId, UserProfile updatedProfile);
    UserProfile updateApprovalStatus(String profileId, ApprovalStatus status);
}
