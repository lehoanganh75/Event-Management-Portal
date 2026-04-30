package com.identityservice.controller;

import com.identityservice.dto.user.request.UserStatusRequest;
import com.identityservice.dto.user.response.UserResponse;
import com.identityservice.entity.User;
import com.identityservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        if (userId == null) {
            throw new RuntimeException("Token missing userId claim");
        }
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody User updatedProfile) {
        String userId = jwt.getSubject();
        if (userId == null) {
            throw new RuntimeException("Token missing userId claim");
        }
        return ResponseEntity.ok(userService.updateUser(userId, updatedProfile));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateAnyProfile(
            @PathVariable String userId,
            @RequestBody User updatedProfile) {
        return ResponseEntity.ok(userService.updateUser(userId, updatedProfile));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}/approval")
    public ResponseEntity<UserResponse> updateApprovalStatus(@PathVariable String userId) {
        userService.approveUser(userId);
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // Admin endpoints
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/roles")
    public ResponseEntity<UserResponse> updateRoles(@PathVariable String id, @RequestBody String role) {
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable String id, @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(userService.updateStatus(id, request.getStatus()));
    }

    @GetMapping("/admin-ids")
    public ResponseEntity<List<String>> getAdminIds() {
        return ResponseEntity.ok(userService.getAdminIds());
    }

    @GetMapping("/super-admin-ids")
    public ResponseEntity<List<String>> getSuperAdminIds() {
        return ResponseEntity.ok(userService.getSuperAdminIds());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(userService.search(keyword));
    }

    @GetMapping("/batch")
    public ResponseEntity<List<UserResponse>> getUsersByIds(@RequestParam List<String> ids) {
        return ResponseEntity.ok(userService.findAllByIds(ids));
    }

    @GetMapping("/invite")
    public ResponseEntity<UserResponse> getUsersById(@RequestParam String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/by-emails")
    public ResponseEntity<List<UserResponse>> getUsersByEmails(@RequestParam List<String> emails) {
        return ResponseEntity.ok(userService.findAllByEmails(emails));
    }
}