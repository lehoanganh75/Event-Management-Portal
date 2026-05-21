package com.eventservice.service.impl;

import com.eventservice.entity.core.Organization;
import com.eventservice.entity.enums.OrganizationStatus;
import com.eventservice.repository.OrganizationRepository;
import com.eventservice.service.OrganizationService;
import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final IdentityServiceClient identityServiceClient;

    private boolean isCurrentCallerAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                String accountId = jwt.getSubject();
                UserResponse user = identityServiceClient.getUsersById(accountId);
                if (user != null && ("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole()))) {
                    return true;
                }
            }
        } catch (Exception e) {
            // ignore
        }
        return false;
    }

    private void populateOwnerDetails(List<Organization> orgs) {
        if (orgs == null || orgs.isEmpty()) {
            return;
        }
        List<String> ownerIds = orgs.stream()
                .map(Organization::getOwnerAccountId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (ownerIds.isEmpty()) {
            return;
        }
        try {
            List<UserResponse> users = identityServiceClient.getUsersByIds(ownerIds);
            if (users != null) {
                java.util.Map<String, UserResponse> userMap = users.stream()
                        .collect(Collectors.toMap(UserResponse::getId, u -> u, (u1, u2) -> u1));
                for (Organization org : orgs) {
                    UserResponse u = userMap.get(org.getOwnerAccountId());
                    if (u != null) {
                        org.setOwnerName(u.getFullName());
                        org.setOwnerEmail(u.getEmail());
                        org.setOwnerPhone(u.getPhone());
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }
    }

    private void populateOwnerDetails(Organization org) {
        if (org == null || org.getOwnerAccountId() == null) {
            return;
        }
        try {
            UserResponse u = identityServiceClient.getUsersById(org.getOwnerAccountId());
            if (u != null) {
                org.setOwnerName(u.getFullName());
                org.setOwnerEmail(u.getEmail());
                org.setOwnerPhone(u.getPhone());
            }
        } catch (Exception e) {
            // ignore
        }
    }

    @Override
    public List<Organization> getAllOrganizations() {
        List<Organization> all = organizationRepository.findByIsDeletedFalse();
        List<Organization> result;
        if (isCurrentCallerAdmin()) {
            result = all;
        } else {
            result = all.stream()
                    .filter(org -> org.getStatus() == null || org.getStatus() == OrganizationStatus.APPROVED)
                    .collect(Collectors.toList());
        }
        populateOwnerDetails(result);
        return result;
    }

    @Override
    public Organization getOrganizationById(String id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
        populateOwnerDetails(org);
        return org;
    }

    @Override
    public Organization createOrganization(Organization organization) {
        organization.setId(null);
        organization.setDeleted(false);
        
        OrganizationStatus status = OrganizationStatus.PENDING;
        String ownerId = organization.getOwnerAccountId();
        if (ownerId != null) {
            try {
                UserResponse user = identityServiceClient.getUsersById(ownerId);
                if (user != null && ("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole()))) {
                    status = OrganizationStatus.APPROVED;
                }
            } catch (Exception e) {
                // ignore
            }
        }
        organization.setStatus(status);
        
        Organization saved = organizationRepository.save(organization);
        populateOwnerDetails(saved);
        return saved;
    }

    @Override
    public List<Organization> getOrganizationsByOwner(String ownerAccountId) {
        List<Organization> result = organizationRepository.findByOwnerAccountIdAndIsDeletedFalse(ownerAccountId);
        populateOwnerDetails(result);
        return result;
    }

    @Override
    public boolean isOrganizationOwner(String organizationId, String accountId) {
        return organizationRepository.findById(organizationId)
                .map(org -> accountId != null && accountId.equals(org.getOwnerAccountId()))
                .orElse(false);
    }

    @Override
    public Organization updateOrganizationStatus(String id, OrganizationStatus status) {
        Organization org = getOrganizationById(id);
        org.setStatus(status);
        Organization saved = organizationRepository.save(org);
        populateOwnerDetails(saved);
        return saved;
    }
}

