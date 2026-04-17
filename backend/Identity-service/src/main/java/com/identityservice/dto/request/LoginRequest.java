package com.identityservice.dto.request;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String username;
    private String password;
}
