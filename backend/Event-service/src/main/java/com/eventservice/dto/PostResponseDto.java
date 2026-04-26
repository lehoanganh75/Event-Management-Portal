package com.eventservice.dto;

import lombok.Data;
import com.eventservice.entity.EventPost;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.entity.enums.PostType;

import java.time.LocalDateTime;

@Data
public class PostResponseDto {
    private String id;
    private String title;
    private String content;
    private PostType postType;
    private PostStatus status;
    private String eventId;
    private String createdByAccountId;
    private UserDto createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.List<String> imageUrls;
    private java.util.Map<String, String> reactions;
    private String eventTitle;

    public static PostResponseDto from(EventPost post, UserDto creator) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setPostType(post.getPostType());
        dto.setStatus(post.getStatus());
        if (post.getEvent() != null) {
            dto.setEventId(post.getEvent().getId());
            dto.setEventTitle(post.getEvent().getTitle());
        }
        // dto.setCreatedByAccountId(post.getCreatedByAccountId());
        dto.setCreatedBy(creator);
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setImageUrls(post.getImageUrls());
        dto.setReactions(post.getReactions());
        return dto;
    }
}