package src.main.eventservice.dto;

import lombok.Data;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.entity.enums.PostType;
import java.time.LocalDateTime;

@Data
public class PostRequestDto {
    private String title;
    private String content;
    private PostType postType;
    private PostStatus status;
    private String eventId;
    private String accountId;
    private LocalDateTime publishedAt;
}