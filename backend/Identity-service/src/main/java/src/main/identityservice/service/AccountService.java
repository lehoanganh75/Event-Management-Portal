package src.main.identityservice.service;

import src.main.identityservice.dto.AccountAdminDTO;
import src.main.identityservice.entity.Account;

import java.util.List;

public interface AccountService {
    List<AccountAdminDTO> getAllAccountsForAdmin();

    void deleteAccount(String accountId);

    AccountAdminDTO updateRoles(String accountId, String role);

    AccountAdminDTO updateStatus(String accountId, String status);

    AccountAdminDTO getAccountByIdForAdmin(String accountId);

    AccountAdminDTO updateAccount(String accountId, AccountAdminDTO updateRequest);
}