package com.eventservice.dto.social.response;

import com.eventservice.dto.core.request.*;
import com.eventservice.dto.core.response.*;
import com.eventservice.dto.registration.request.*;
import com.eventservice.dto.registration.response.*;
import com.eventservice.dto.social.request.*;
import com.eventservice.dto.social.response.*;
import com.eventservice.dto.plan.request.*;
import com.eventservice.dto.plan.response.*;
import com.eventservice.dto.user.*;
import com.eventservice.dto.engagement.*;
import com.eventservice.dto.engagement.quiz.*;
import com.eventservice.dto.engagement.survey.*;

import lombok.Data;
import com.eventservice.entity.social.EventPost;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.entity.enums.PostType;

import java.time.LocalDateTime;

@Data
public class EventPostResponse {
    private String id;
    private String title;
    private String content;
    private PostType postType;
    private PostStatus status;
    private String eventId;
    private String createdByAccountId;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.List<String> imageUrls;
    private java.util.Map<String, String> reactions;
    private String eventTitle;

    public static EventPostResponse from(EventPost post, UserResponse creator) {
        EventPostResponse dto = new EventPostResponse();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setPostType(post.getPostType());
        dto.setStatus(post.getStatus());
        dto.setEventId(post.getEvent().getId());
        dto.setEventTitle(post.getEvent().getTitle());
        // dto.setCreatedByAccountId(post.getCreatedByAccountId());
        dto.setCreatedBy(creator);
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setImageUrls(post.getImageUrls());
        dto.setReactions(post.getReactions());
        return dto;
    }
}

