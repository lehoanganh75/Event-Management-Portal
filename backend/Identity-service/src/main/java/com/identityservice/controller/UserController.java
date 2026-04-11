package com.identityservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.identityservice.dto.UserDto;
import com.identityservice.entity.User;
import com.identityservice.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();

        System.out.println("User id" + accountId);

        if (accountId == null) {
            throw new RuntimeException("Token missing accountId claim");
        }

        return ResponseEntity.ok(userService.getProfileByUserId(accountId));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody User updatedProfile) {
        String accountId = jwt.getSubject();

        if (accountId == null) {
            throw new RuntimeException("Token missing accountId claim");
        }

        return ResponseEntity.ok(userService.updateProfile(accountId, updatedProfile));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{accountId}/approval")
    public ResponseEntity<User> updateApprovalStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String status) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(userService.updateApprovalStatus(accountId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam(required = false) String keyword) {
        List<User> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/batch")
    public ResponseEntity<List<UserDto>> getUsersByIds(@RequestParam List<String> ids) {
        return ResponseEntity.ok(userService.getUsersByIds(ids));
    }

    @GetMapping("/invite")
    public ResponseEntity<UserDto> getUsersById(@RequestParam String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
