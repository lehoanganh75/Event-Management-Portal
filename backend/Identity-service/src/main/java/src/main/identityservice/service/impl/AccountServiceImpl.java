package src.main.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.identityservice.dto.AccountAdminDTO;
import src.main.identityservice.entity.Account;
import src.main.identityservice.entity.AccountStatus;
import src.main.identityservice.entity.Role;
import src.main.identityservice.entity.User;
import src.main.identityservice.repository.AccountRepository;
import src.main.identityservice.repository.UserRepository;
import src.main.identityservice.service.AccountService;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Override
    public List<AccountAdminDTO> getAllAccountsForAdmin() {
        return accountRepository.findAllWithProfile().stream()
                .map(this::toAdminDTO)
                .toList();
    }
    @Override
    public void deleteAccount(String accountId) {
        Account account = getAccountOrThrow(accountId);
        accountRepository.delete(account);
    }

    @Override
    public AccountAdminDTO updateRoles(String accountId, List<String> roleNames) {
        Account account = getAccountOrThrow(accountId);

        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("Danh sách role không được để trống");
        }

        Set<Role> newRoles = roleNames.stream()
                .map(name -> {
                    try {
                        return Role.valueOf(name.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException("Vai trò không hợp lệ: " + name);
                    }
                })
                .collect(Collectors.toSet());

        // set mới thay vì clear + add
        account.setRoles(newRoles);

        Account saved = accountRepository.save(account);
        return toAdminDTO(saved);
    }

    @Override
    public AccountAdminDTO updateStatus(String accountId, String status) {
        Account account = getAccountOrThrow(accountId);

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status không được để trống");
        }

        try {
            AccountStatus statusEnum = AccountStatus.valueOf(status.toUpperCase());
            account.setStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Trạng thái không hợp lệ: " + status +
                            ". Các giá trị hợp lệ: " + getValidStatusValues()
            );
        }

        Account saved = accountRepository.save(account);
        return toAdminDTO(saved);
    }

    @Override
    public AccountAdminDTO getAccountByIdForAdmin(String accountId) {
        return toAdminDTO(getAccountOrThrow(accountId));
    }

    // ================= HELPER =================

    private Account getAccountOrThrow(String accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException("Tài khoản không tồn tại: " + accountId));
    }

    private AccountAdminDTO toAdminDTO(Account account) {

        String fullName = (account.getUserProfile() != null && account.getUserProfile().getFullName() != null)
                ? account.getUserProfile().getFullName()
                : "Chưa có hồ sơ";

        String createdAtStr = (account.getCreatedAt() != null)
                ? account.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
                : null;

        List<String> roleNames = (account.getRoles() != null)
                ? account.getRoles().stream()
                .map(Enum::name)
                .toList()
                : List.of();

        String status = (account.getStatus() != null)
                ? account.getStatus().name()
                : "UNKNOWN";

        return new AccountAdminDTO(
                account.getId(),
                account.getUsername(),
                account.getEmail(),
                fullName,
                roleNames,
                status,
                createdAtStr
        );
    }

    private String getValidStatusValues() {
        return String.join(", ",
                java.util.Arrays.stream(AccountStatus.values())
                        .map(Enum::name)
                        .toList());
    }

    @Override
    public AccountAdminDTO updateAccount(String accountId, AccountAdminDTO updateRequest) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại: " + accountId));

        if (updateRequest.email() != null && !updateRequest.email().isEmpty()) {
            accountRepository.findByEmail(updateRequest.email())
                    .ifPresent(existingAccount -> {
                        if (!existingAccount.getId().equals(accountId)) {
                            throw new RuntimeException("Email đã được sử dụng");
                        }
                    });
            account.setEmail(updateRequest.email());
        }

        if (updateRequest.username() != null && !updateRequest.username().isEmpty()) {
            accountRepository.findByUsername(updateRequest.username())
                    .ifPresent(existingAccount -> {
                        if (!existingAccount.getId().equals(accountId)) {
                            throw new RuntimeException("Username đã được sử dụng");
                        }
                    });
            account.setUsername(updateRequest.username());
        }

        if (updateRequest.status() != null) {
            try {
                AccountStatus statusEnum = AccountStatus.valueOf(updateRequest.status().toUpperCase());
                account.setStatus(statusEnum);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + updateRequest.status());
            }
        }

        if (updateRequest.fullName() != null) {
            User profile = account.getUserProfile();
            if (profile == null) {
                profile = new User();
                profile.setAccount(account);
                account.setUserProfile(profile);
            }
            profile.setFullName(updateRequest.fullName());
            userRepository.save(profile);
        }

        if (updateRequest.roles() != null && !updateRequest.roles().isEmpty()) {
            Set<Role> newRoles = updateRequest.roles().stream()
                    .map(name -> {
                        try {
                            return Role.valueOf(name.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            throw new IllegalArgumentException("Vai trò không hợp lệ: " + name);
                        }
                    })
                    .collect(Collectors.toSet());
            account.setRoles(newRoles);
        }

        Account saved = accountRepository.save(account);
        return toAdminDTO(saved);
    }
}