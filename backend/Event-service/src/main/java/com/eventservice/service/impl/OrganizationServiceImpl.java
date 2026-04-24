package com.eventservice.service.impl;

import com.eventservice.entity.Organization;
import com.eventservice.repository.OrganizationRepository;
import com.eventservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {
    private final OrganizationRepository organizationRepository;

    @Override
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findByIsDeletedFalse();
    }

    @Override
    public Organization getOrganizationById(String id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    @Override
    public Organization createOrganization(Organization organization) {
        organization.setId(null);
        organization.setDeleted(false);
        return organizationRepository.save(organization);
    }
}
