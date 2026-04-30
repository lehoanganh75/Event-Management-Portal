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
import java.util.Map;

@Data
public class EventPostDetailResponse {
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

    private UserResponse author;

    // Danh sách bình luận đã được xử lý phân cấp
    private List<PostCommentResponse> comments;

    private List<String> imageUrls;
    private Map<String, String> reactions;

    private String eventId;
    private String eventTitle;
}

