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

    public static OrganizationResponse from(Organization org) {
        if (org == null)
            return null;
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .logoUrl(org.getLogoUrl())
                .type(org.getType() != null ? org.getType().name() : null)
                .build();
    }
}
