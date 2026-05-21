package com.eventservice.controller;

import com.eventservice.entity.core.Organization;
import com.eventservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable String id) {
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    /**
     * Lấy danh sách tổ chức mà user hiện tại sở hữu (ownerAccountId = currentUser)
     * Dùng cho frontend để hiển thị dropdown organization khi STUDENT tạo event.
     */
    @GetMapping("/my-owned")
    public ResponseEntity<List<Organization>> getMyOwnedOrganizations(
            @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(organizationService.getOrganizationsByOwner(accountId));
    }

    @PostMapping
    public ResponseEntity<Organization> createOrganization(
            @RequestBody Organization organization,
            @AuthenticationPrincipal Jwt jwt) {
        
        organization.setOwnerAccountId(jwt.getSubject());
        return ResponseEntity.ok(organizationService.createOrganization(organization));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Organization> updateOrganizationStatus(
            @PathVariable String id,
            @RequestParam com.eventservice.entity.enums.OrganizationStatus status) {
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(id, status));
    }
}
