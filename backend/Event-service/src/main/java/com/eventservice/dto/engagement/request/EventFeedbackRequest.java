package com.eventservice.dto.engagement.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventFeedbackRequest {
    private String reviewerAccountId;
    private Integer rating;
    private String title;
    private String comment;
    private String ratingReason;
    private List<String> imageUrls;
    @com.fasterxml.jackson.annotation.JsonProperty("isAnonymous")
    private boolean isAnonymous;
}
