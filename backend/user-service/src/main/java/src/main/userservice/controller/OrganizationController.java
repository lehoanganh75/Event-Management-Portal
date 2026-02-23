package src.main.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.userservice.entity.Organization;
import src.main.userservice.entity.UserProfile;
import src.main.userservice.service.OrganizationService;
import src.main.userservice.service.UserProfileService;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService orgService;

    @GetMapping
    public ResponseEntity<List<Organization>> getAll() {
        return ResponseEntity.ok(orgService.getAllOrganizations());
    }

    @PostMapping
    public ResponseEntity<Organization> create(@RequestBody Organization org) {
        return ResponseEntity.ok(orgService.createOrganization(org));
    }

    @PutMapping
    public ResponseEntity<Organization> update(@RequestBody Organization org) {
        return ResponseEntity.ok(orgService.updateOrganization(org));
    }

    @GetMapping("/approvals/pending")
    public ResponseEntity<List<UserProfile>> getPendingApprovals() {
        return ResponseEntity.ok(orgService.getPendingApprovals());
    }
}
