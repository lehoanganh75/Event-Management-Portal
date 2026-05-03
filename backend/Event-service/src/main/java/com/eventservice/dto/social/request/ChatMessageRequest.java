package com.eventservice.dto.social.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {

    @NotBlank(message = "Session ID không được để trống")
    private String sessionId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;

    private String messageType; // TEXT, SUGGESTION, etc.

    private Map<String, Object> metadata; // Additional data

    private Boolean streamResponse; // Enable streaming response
}
