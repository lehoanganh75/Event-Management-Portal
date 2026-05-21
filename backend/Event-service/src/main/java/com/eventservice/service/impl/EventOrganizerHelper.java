package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.people.EventOrganizer;
import com.eventservice.entity.enums.OrganizerRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@Slf4j
public class EventOrganizerHelper {
    private final IdentityServiceClient identityClient;

    public EventOrganizerHelper(IdentityServiceClient identityClient) {
        this.identityClient = identityClient;
    }

    public void enrichAndValidateOrganizer(EventOrganizer organizer, Event event) {
        String accountId = organizer.getAccountId();
        if (accountId == null) return;

        // 1. Fetch user role from Identity Service
        String systemRole = "STUDENT"; // fallback
        try {
            UserResponse user = identityClient.getUsersById(accountId);
            if (user != null && user.getRole() != null) {
                systemRole = user.getRole();
            }
        } catch (Exception e) {
            log.warn("Could not fetch system role for account ID: {}", accountId);
        }

        // 2. Check organization owner status
        boolean isOwner = event.getOrganization() != null 
                && accountId.equals(event.getOrganization().getOwnerAccountId());

        boolean isStaff = "SUPER_ADMIN".equals(systemRole) 
                || "ADMIN".equals(systemRole) 
                || "LECTURER".equals(systemRole);

        // 3. Enforce business rules
        if (isStaff) {
            organizer.setOrganization(event.getOrganization());
            if (organizer.getRole() == null) {
                organizer.setRole(OrganizerRole.LEADER);
            }
        } else if (isOwner) {
            // STUDENT / GUEST who owns the organization
            organizer.setOrganization(event.getOrganization());
            organizer.setRole(OrganizerRole.LEADER);
        } else {
            // Regular Student or Guest helper
            organizer.setOrganization(null);
            organizer.setRole(OrganizerRole.MEMBER);
        }
    }

    public void validateRoleUpdate(EventOrganizer organizer, OrganizerRole newRole) {
        String accountId = organizer.getAccountId();
        Event event = organizer.getEvent();
        if (accountId == null || event == null) return;

        String systemRole = "STUDENT";
        try {
            UserResponse user = identityClient.getUsersById(accountId);
            if (user != null && user.getRole() != null) {
                systemRole = user.getRole();
            }
        } catch (Exception e) {
            log.warn("Could not fetch system role for account ID: {}", accountId);
        }

        boolean isOwner = event.getOrganization() != null 
                && accountId.equals(event.getOrganization().getOwnerAccountId());

        boolean isStaff = "SUPER_ADMIN".equals(systemRole) 
                || "ADMIN".equals(systemRole) 
                || "LECTURER".equals(systemRole);

        if (isStaff) {
            // Staff roles can be updated to any role
        } else if (isOwner) {
            // Owner role must be LEADER
            if (newRole != OrganizerRole.LEADER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Organization owner must have LEADER role");
            }
        } else {
            // Regular helper role must be MEMBER
            if (newRole != OrganizerRole.MEMBER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Regular student helpers can only have MEMBER role");
            }
        }
    }
}
