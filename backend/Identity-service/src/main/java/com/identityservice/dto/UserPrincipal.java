package com.identityservice.dto;

import com.identityservice.entity.Role;

public class UserPrincipal {
    private String accountId;
    private Role role;

    public UserPrincipal() {}

    public UserPrincipal(String accountId, Role role) {
        this.accountId = accountId;
        this.role = role;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
