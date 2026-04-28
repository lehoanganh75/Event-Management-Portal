package com.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.identityservice.dto.AccountAdminDTO;
import com.identityservice.entity.Account;
import com.identityservice.entity.AccountStatus;
import com.identityservice.entity.Role;
import com.identityservice.entity.User;
import com.identityservice.repository.AccountRepository;
import com.identityservice.repository.UserRepository;
import com.identityservice.service.AccountService;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.kafka.core.KafkaTemplate;
import com.identityservice.dto.NotificationEvent;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public AccountServiceImpl(AccountRepository accountRepository, 
                              UserRepository userRepository,
                              KafkaTemplate<String, Object> kafkaTemplate) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

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
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Danh sách role không được để trống");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleName.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vai trò không hợp lệ: " + roleName);
        }

        account.setRole(newRole);

        Account saved = accountRepository.save(account);
        return toAdminDTO(saved);
    }

    @Override
    public AccountAdminDTO updateStatus(String accountId, String status) {
        Account account = getAccountOrThrow(accountId);

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Status không được để trống");
        }

        try {
            AccountStatus oldStatus = account.getStatus();
            AccountStatus statusEnum = AccountStatus.valueOf(status.toUpperCase());
            account.setStatus(statusEnum);

            // Nếu khóa tài khoản, gửi thông báo realtime để logout
            if (statusEnum != AccountStatus.ACTIVE && oldStatus == AccountStatus.ACTIVE) {
                NotificationEvent event = NotificationEvent.builder()
                        .recipientId(accountId)
                        .title("Tài khoản bị khóa")
                        .message("Tài khoản của bạn đã bị quản trị viên khóa. Bạn sẽ bị đăng xuất ngay lập tức.")
                        .type("ACCOUNT_LOCKED")
                        .build();
                kafkaTemplate.send("notification-topic", event);
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
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
                        new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản không tồn tại: " + accountId));
    }

    private AccountAdminDTO toAdminDTO(Account account) {

        String fullName = Optional.ofNullable(account.getUser())
                .map(User::getFullName)
                .orElse("Chưa có hồ sơ");

        String createdAtStr = Optional.ofNullable(account.getCreatedAt())
                .map(date -> date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .orElse(null);

        return new AccountAdminDTO(
                account.getId(),
                account.getUsername(),
                account.getEmail(),
                fullName,
                Role.valueOf(account.getRole().name()),
                account.getStatus(),
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản không tồn tại: " + accountId));

        if (updateRequest.email() != null && !updateRequest.email().isBlank()) {
            accountRepository.findByEmail(updateRequest.email())
                    .filter(acc -> !acc.getId().equals(accountId))
                    .ifPresent(acc -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng");
                    });
            account.setEmail(updateRequest.email());
        }

        if (updateRequest.username() != null && !updateRequest.username().isBlank()) {
            accountRepository.findByUsername(updateRequest.username())
                    .filter(acc -> !acc.getId().equals(accountId))
                    .ifPresent(acc -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Username đã được sử dụng");
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

        if (updateRequest.role() != null) {
            account.setRole(updateRequest.role());
        }

        return toAdminDTO(accountRepository.save(account));
    }
    @Override
    public List<String> getAdminAccountIds() {
        return accountRepository.findIdsByRoleIn(List.of(Role.ADMIN, Role.SUPER_ADMIN));
    }

    @Override
    public List<String> getSuperAdminAccountIds() {
        return accountRepository.findIdsByRoleIn(List.of(Role.SUPER_ADMIN));
    }
}