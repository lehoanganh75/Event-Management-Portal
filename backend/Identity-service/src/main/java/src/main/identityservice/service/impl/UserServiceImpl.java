package src.main.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.identityservice.entity.Account;
import src.main.identityservice.entity.Role;
import src.main.identityservice.entity.User;
import src.main.identityservice.repository.AccountRepository;
import src.main.identityservice.repository.UserRepository;
import src.main.identityservice.service.UserService;

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

        Set<Role> roles = account.getRoles();
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }

        return roles.stream()
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
}
