package src.main.identityservice.service;

import src.main.identityservice.entity.User;

public interface UserService {
    User getProfileByUserId(String userId);
    User updateProfile(String accountId, User updatedProfile);
    User updateApprovalStatus(String profileId);
    String getUserProfileIdByAccountId(String accountId);
}
