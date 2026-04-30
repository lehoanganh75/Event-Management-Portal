package com.eventservice.dto.social.request;

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

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

