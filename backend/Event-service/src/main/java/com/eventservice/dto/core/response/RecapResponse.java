package com.eventservice.dto.core.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.eventservice.entity.report.Recap;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecapResponse {
    private String id;
    private String content;
    private List<String> imageUrls;
    private LocalDateTime createdAt;

    public static RecapResponse from(Recap recap) {
        if (recap == null) return null;
        return RecapResponse.builder()
                .id(recap.getId())
                .content(recap.getContent())
                .imageUrls(recap.getImageUrls())
                .createdAt(recap.getCreatedAt())
                .build();
    }
}
