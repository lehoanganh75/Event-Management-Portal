package com.eventservice.dto.social.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostInteractionEvent {
    public enum Type {
        LIKE, COMMENT, VIEW, COMMENT_LIKE, DELETE_COMMENT
    }

    private String postId;
    private Type type;
    private Object data; // Can be reactions map, comment object, or viewCount
}
