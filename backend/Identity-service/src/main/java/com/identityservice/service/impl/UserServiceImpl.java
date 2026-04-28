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
import com.identityservice.entity.AccountStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public UserServiceImpl(UserRepository userRepository, AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public User getProfileByUserId(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for userId ID: " + userId));

        if (user.getAccount().getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.");
        }
        return user;
    }

    @Override
    public User updateProfile(String accountId, User updatedProfile) {
        User userProfile = userRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("User profile not found for account ID: " + accountId));
        userProfile.setFullName(updatedProfile.getFullName());
        userProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        userProfile.setGender(updatedProfile.getGender());
        userProfile.setMajorName(updatedProfile.getMajorName());
        userProfile.setLoginCode(updatedProfile.getLoginCode());
        userProfile.setPhone(updatedProfile.getPhone());
        userProfile.setOrganizationId(updatedProfile.getOrganizationId());
        userProfile.setOrganizationName(updatedProfile.getOrganizationName());
        userProfile.setPosition(updatedProfile.getPosition());
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

    @Override
    public List<UserDto> getUsersByEmails(List<String> emails) {
        List<User> users = userRepository.findAllByAccountEmailIn(emails);
        return users.stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }
}