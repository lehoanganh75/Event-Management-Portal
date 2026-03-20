package src.main.eventservice.dto;

import lombok.Data;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.entity.enums.PostType;
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

    public static PostResponseDto from(EventPost post, UserDto creator) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setPostType(post.getPostType());
        dto.setStatus(post.getStatus());
        dto.setEventId(post.getEvent().getId());
        dto.setCreatedByAccountId(post.getCreatedByAccountId());
        dto.setCreatedBy(creator);
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        return dto;
    }
}