package com.eventservice.service;

import com.eventservice.entity.core.Organization;
import java.util.List;

public interface OrganizationService {
    List<Organization> getAllOrganizations();
    Organization getOrganizationById(String id);
    Organization createOrganization(Organization organization);
}
