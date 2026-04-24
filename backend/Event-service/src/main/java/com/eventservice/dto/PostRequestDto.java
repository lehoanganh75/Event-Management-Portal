package com.eventservice.dto;

import lombok.Data;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.entity.enums.PostType;

import java.util.List;
import java.time.LocalDateTime;

@Data
public class PostRequestDto {
    private String title;
    private String content;
    private PostType postType;
    private PostStatus status;
    private String eventId;
    private String accountId;
    private List<String> imageUrls;
    private LocalDateTime publishedAt;
}