package com.identityservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.identityservice.dto.AccountAdminDTO;
import com.identityservice.dto.StatusRequest;
import com.identityservice.service.AccountService;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountAdminDTO>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccountsForAdmin());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<AccountAdminDTO> updateAccount(
            @PathVariable String id,
            @RequestBody AccountAdminDTO updateRequest) {

        return ResponseEntity.ok(accountService.updateAccount(id, updateRequest));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<AccountAdminDTO> updateRoles(
            @PathVariable String id,
            @RequestBody String role
    ) {
        return ResponseEntity.ok(accountService.updateRoles(id, role));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AccountAdminDTO> updateStatus(
            @PathVariable String id,
            @RequestBody StatusRequest request) {

        return ResponseEntity.ok(
                accountService.updateStatus(id, request.getStatus())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountAdminDTO> getAccountById(@PathVariable String id) {
        return ResponseEntity.ok(accountService.getAccountByIdForAdmin(id));
    }

    @GetMapping("/admin-ids")
    public ResponseEntity<List<String>> getAdminAccountIds() {
        return ResponseEntity.ok(accountService.getAdminAccountIds());
    }
}
