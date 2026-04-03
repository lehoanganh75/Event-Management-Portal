package src.main.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import java.util.Optional;
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
    public AccountAdminDTO updateRoles(String accountId, String roleName) {
        Account account = getAccountOrThrow(accountId);

        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Danh sách role không được để trống");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleName.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Vai trò không hợp lệ: " + roleName);
        }

        account.setRole(newRole);

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

        String fullName = Optional.ofNullable(account.getUser())
                .map(User::getFullName)
                .orElse("Chưa có hồ sơ");

        String createdAtStr = Optional.ofNullable(account.getCreatedAt())
                .map(date -> date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .orElse(null);

        List<String> roleNames = (account.getRole() != null)
                ? List.of(account.getRole().name())
                : List.of();

        String status = Optional.ofNullable(account.getStatus())
                .map(Enum::name)
                .orElse("UNKNOWN");

        return new AccountAdminDTO(
                account.getId(),
                account.getUsername(),
                account.getEmail(),
                fullName,
                Role.valueOf(status.toUpperCase()),
                AccountStatus.PENDING,
                createdAtStr
        );
    }

    private String getValidStatusValues() {
        return String.join(", ",
                java.util.Arrays.stream(AccountStatus.values())
                        .map(Enum::name)
                        .toList());
    }

    @Transactional
    @Override
    public AccountAdminDTO updateAccount(String accountId, AccountAdminDTO updateRequest) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại: " + accountId));

        if (updateRequest.email() != null && !updateRequest.email().isBlank()) {
            accountRepository.findByEmail(updateRequest.email())
                    .filter(acc -> !acc.getId().equals(accountId))
                    .ifPresent(acc -> {
                        throw new RuntimeException("Email đã được sử dụng");
                    });
            account.setEmail(updateRequest.email());
        }

        if (updateRequest.username() != null && !updateRequest.username().isBlank()) {
            accountRepository.findByUsername(updateRequest.username())
                    .filter(acc -> !acc.getId().equals(accountId))
                    .ifPresent(acc -> {
                        throw new RuntimeException("Username đã được sử dụng");
                    });
            account.setUsername(updateRequest.username());
        }

        if (updateRequest.fullName() != null) {
            User profile = Optional.ofNullable(account.getUser())
                    .orElseGet(() -> {
                        User u = new User();
                        u.setAccount(account);
                        account.setUser(u);
                        return u;
                    });

            profile.setFullName(updateRequest.fullName());
        }

        return toAdminDTO(accountRepository.save(account));
    }
}