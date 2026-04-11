package com.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.identityservice.dto.UserDto;
import com.identityservice.entity.Account;
import com.identityservice.entity.Role;
import com.identityservice.entity.User;
import com.identityservice.repository.AccountRepository;
import com.identityservice.repository.UserRepository;
import com.identityservice.service.UserService;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Override
    public User getProfileByUserId(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found for userId ID: " + userId));
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
    public List<String> getRolesByAccountId(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));

        Role roles = account.getRole();
        return Set.of(roles).stream()
                .map(Role::name)
                .collect(Collectors.toList());
    }

    @Override
    public User updateApprovalStatus(String profileId) {
        User userProfile = userRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + profileId));
        return userRepository.save(userProfile);
    }

    @Override
    public String getUserProfileIdByAccountId(String accountId) {

        return userRepository.findByAccountId(accountId)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + accountId));
    }

    @Override
    public List<User> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll();
        }
        return userRepository.searchUsers(keyword);
    }

    @Override
    public List<UserDto> getUsersByIds(List<String> ids) {
        List<User> users = userRepository.findAllById(ids);

        return users.stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(String id) {
        return userRepository.findById(id)
                .map(UserDto::from)
                .orElseThrow(() -> new RuntimeException("User profile not found for ID: " + id));
    }
}