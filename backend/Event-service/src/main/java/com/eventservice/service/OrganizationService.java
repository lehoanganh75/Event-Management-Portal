package com.eventservice.service;

import com.eventservice.entity.core.Organization;
import java.util.List;

public interface OrganizationService {
    List<Organization> getAllOrganizations();
    Organization getOrganizationById(String id);
    Organization createOrganization(Organization organization);

    /**
     * Lấy danh sách Organization mà user sở hữu (ownerAccountId == accountId)
     */
    List<Organization> getOrganizationsByOwner(String ownerAccountId);

    /**
     * Kiểm tra user có phải owner của organization không
     */
    boolean isOrganizationOwner(String organizationId, String accountId);
    Organization updateOrganizationStatus(String id, com.eventservice.entity.enums.OrganizationStatus status);
}
