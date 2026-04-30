package com.identityservice.service;

import com.identityservice.dto.user.response.UserResponse;
import com.identityservice.entity.User;

import java.util.List;

public interface UserService {
    // --- Retrieval Operations ---
    UserResponse getUserById(String userId);
    List<UserResponse> findAllByIds(List<String> ids);
    List<UserResponse> findAllByEmails(List<String> emails);
    List<UserResponse> search(String keyword);

    // --- Modification Operations ---
    UserResponse updateUser(String userId, User updatedProfile);

    // --- Admin Operations ---
    List<UserResponse> findAll();
    User approveUser(String userId);
    UserResponse updateStatus(String userId, String status);
    UserResponse updateRole(String userId, String roleName);
    void delete(String userId);
    List<String> getAdminIds();
    List<String> getSuperAdminIds();
}
