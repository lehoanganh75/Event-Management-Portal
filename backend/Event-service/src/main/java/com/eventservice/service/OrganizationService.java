package com.eventservice.service;

import com.eventservice.entity.Organization;
import java.util.List;

public interface OrganizationService {
    List<Organization> getAllOrganizations();
    Organization getOrganizationById(String id);
    Organization createOrganization(Organization organization);
}
