package com.eventservice.dto.core.response;

import lombok.*;
import com.eventservice.entity.core.Organization;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponse {
    private String id;
    private String name;
    private String logoUrl;
    private String type;
    private String status;
    private String ownerAccountId;
    private String description;
    private String email;
    private String phone;
    private String officeLocation;

    public static OrganizationResponse from(Organization org) {
        if (org == null)
            return null;
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .logoUrl(org.getLogoUrl())
                .type(org.getType() != null ? org.getType().name() : null)
                .status(org.getStatus() != null ? org.getStatus().name() : null)
                .ownerAccountId(org.getOwnerAccountId())
                .description(org.getDescription())
                .email(org.getEmail())
                .phone(org.getPhone())
                .officeLocation(org.getOfficeLocation())
                .build();
    }
}
