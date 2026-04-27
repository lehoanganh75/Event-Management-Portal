package com.identityservice.service;

import com.identityservice.dto.UserDto;
import com.identityservice.entity.User;

import java.util.List;

public interface UserService {
    User getProfileByUserId(String userId);
    User updateProfile(String accountId, User updatedProfile);

    List<String> getRolesByAccountId(String accountId);

    User updateApprovalStatus(String profileId);
    String getUserProfileIdByAccountId(String accountId);
    List<User> searchUsers(String keyword);

    List<UserDto> getUsersByIds(List<String> ids);

    UserDto getUserById(String id);
    List<UserDto> getUsersByEmails(List<String> emails);
}
