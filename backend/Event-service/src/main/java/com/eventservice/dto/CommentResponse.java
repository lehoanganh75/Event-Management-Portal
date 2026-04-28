package com.eventservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {
    private String id;
    private String content;
    private UserDto commenter; // Thông tin người bình luận
    private LocalDateTime createdAt;
    private List<CommentResponse> replies;
    private java.util.Map<String, String> reactions;
}
