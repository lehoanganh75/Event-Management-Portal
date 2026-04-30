package com.identityservice.service.impl;

import com.identityservice.dto.notification.NotificationEvent;
import com.identityservice.dto.user.response.UserResponse;
import com.identityservice.entity.AccountStatus;
import com.identityservice.entity.Gender;
import com.identityservice.entity.Role;
import com.identityservice.entity.User;
import com.identityservice.repository.UserRepository;
import com.identityservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // --- Retrieval Operations ---

    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found or has been deleted: " + userId));

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.");
        }
        return toUserResponse(user);
    }

    @Override
    public List<UserResponse> findAllByIds(List<String> ids) {
        return userRepository.findAllByIdInAndIsDeletedFalse(ids).stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> findAllByEmails(List<String> emails) {
        return userRepository.findAllByEmailInAndIsDeletedFalse(emails).stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> search(String keyword) {
        List<User> users;
        if (keyword == null || keyword.trim().isEmpty()) {
            users = userRepository.findAllByIsDeletedFalse();
        } else {
            users = userRepository.searchUsers(keyword);
        }
        return users.stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    // --- Modification Operations ---

    @Override
    public UserResponse updateUser(String userId, User updatedProfile) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found or deleted: " + userId));

        if (updatedProfile.getFullName() != null)
            user.setFullName(updatedProfile.getFullName());
        if (updatedProfile.getDateOfBirth() != null)
            user.setDateOfBirth(updatedProfile.getDateOfBirth());
        if (updatedProfile.getGender() != null)
            user.setGender(updatedProfile.getGender());
        if (updatedProfile.getPhone() != null)
            user.setPhone(updatedProfile.getPhone());
        if (updatedProfile.getBio() != null)
            user.setBio(updatedProfile.getBio());
        if (updatedProfile.getAvatarUrl() != null)
            user.setAvatarUrl(updatedProfile.getAvatarUrl());

        return toUserResponse(userRepository.save(user));
    }

    // --- Admin Operations ---

    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAllByIsDeletedFalse().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public User approveUser(String userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found or deleted: " + userId));
        user.setStatus(AccountStatus.ACTIVE);
        return userRepository.save(user);
    }

    @Override
    public UserResponse updateStatus(String userId, String status) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found or deleted"));

        try {
            AccountStatus oldStatus = user.getStatus();
            AccountStatus newStatus = AccountStatus.valueOf(status.toUpperCase());
            user.setStatus(newStatus);

            if (newStatus != AccountStatus.ACTIVE && oldStatus == AccountStatus.ACTIVE) {
                NotificationEvent event = NotificationEvent.builder()
                        .recipientId(userId)
                        .title("Tài khoản bị khóa")
                        .message("Tài khoản của bạn đã bị quản trị viên khóa. Bạn sẽ bị đăng xuất ngay lập tức.")
                        .type("ACCOUNT_LOCKED")
                        .build();
                kafkaTemplate.send("notification-topic", event);
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }

        return toUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateRole(String userId, String roleName) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found or deleted"));

        try {
            Role newRole = Role.valueOf(roleName.trim().toUpperCase());
            user.setRole(newRole);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleName);
        }

        return toUserResponse(userRepository.save(user));
    }

    @Override
    public void delete(String userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found or already deleted"));
        user.setDeleted(true);
        userRepository.save(user);
    }

    @Override
    public List<String> getAdminIds() {
        return userRepository.findIdsByRoleIn(List.of(Role.ADMIN, Role.SUPER_ADMIN));
    }

    @Override
    public List<String> getSuperAdminIds() {
        return userRepository.findIdsByRoleIn(List.of(Role.SUPER_ADMIN));
    }

    // --- Helper Methods ---

    private UserResponse toUserResponse(User user) {
        if (user == null)
            return null;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .bio(user.getBio())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}