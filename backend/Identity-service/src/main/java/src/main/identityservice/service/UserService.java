package src.main.identityservice.service;

import src.main.identityservice.entity.Account;
import src.main.identityservice.entity.User;

import java.util.List;

public interface UserService {

    User getProfileByUserId(String userId);
    User updateProfile(String accountId, User updatedProfile);

    List<String> getRolesByAccountId(String accountId);

    User updateApprovalStatus(String profileId);

    String getUserProfileIdByAccountId(String accountId);
}
