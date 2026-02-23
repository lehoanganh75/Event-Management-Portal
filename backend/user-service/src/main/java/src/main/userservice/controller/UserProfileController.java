package src.main.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import src.main.userservice.entity.ApprovalStatus;
import src.main.userservice.entity.UserProfile;
import src.main.userservice.service.UserProfileService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfile> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");

        if (accountId == null) {
            throw new RuntimeException("Token missing accountId claim");
        }

        return ResponseEntity.ok(profileService.getProfileByAccountId(accountId));
    }

    // 2. Cập nhật hồ sơ cá nhân
    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserProfile updatedProfile) {
        String accountId = jwt.getClaimAsString("accountId");

        if (accountId == null) {
            throw new RuntimeException("Token missing accountId claim");
        }

        return ResponseEntity.ok(profileService.updateProfile(accountId, updatedProfile));
    }

    // 3. Dành cho admin: Phê duyệt hoặc từ chối hồ sơ người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{accountId}/approval")
    public ResponseEntity<UserProfile> updateApprovalStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String status) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(profileService.updateApprovalStatus(accountId, ApprovalStatus.valueOf(status)));
    }
}
