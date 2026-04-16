package com.eventservice.dto;

import com.eventservice.entity.enums.PostStatus;
import com.eventservice.entity.enums.PostType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDetailResponse {
    private String id;
    private String slug;
    private String title;
    private String content;
    private PostType postType;
    private PostStatus status = PostStatus.DRAFT;
    private boolean isPinned = false;
    private boolean allowComments = true;
    private int viewCount = 0;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted;

    private UserDto author;

    // Danh sách bình luận đã được xử lý phân cấp
    private List<CommentResponse> comments;
}
