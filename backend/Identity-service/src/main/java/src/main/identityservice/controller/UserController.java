package src.main.identityservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import src.main.identityservice.entity.ApprovalStatus;
import src.main.identityservice.entity.User;
import src.main.identityservice.service.UserService;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("userId");

        if (userId == null) {
            throw new RuntimeException("Token missing accountId claim");
        }

        return ResponseEntity.ok(userService.getProfileByUserId(userId));
    }

    // 2. Cập nhật hồ sơ cá nhân
    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody User updatedProfile) {
        String accountId = jwt.getClaimAsString("accountId");

        if (accountId == null) {
            throw new RuntimeException("Token missing accountId claim");
        }

        return ResponseEntity.ok(userService.updateProfile(accountId, updatedProfile));
    }

    // 3. Dành cho admin: Phê duyệt hoặc từ chối hồ sơ người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{accountId}/approval")
    public ResponseEntity<User> updateApprovalStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String status) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(userService.updateApprovalStatus(accountId));
    }
}
