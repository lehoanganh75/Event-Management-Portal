package com.eventservice.dto.engagement;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QAMessageDto {
    private String id;
    private String eventId;
    private String senderAccountId;
    private String senderName;
    private String senderAvatar;
    private String content;
    private boolean isAnswered;
    private String answerContent;
    private String answeredByAccountId;
    private String answeredByName;
    private LocalDateTime createdAt;
    private int upvotes;
    private boolean isHidden;
}
