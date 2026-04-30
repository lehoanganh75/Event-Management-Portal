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

import jakarta.validation.constraints.Email;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionRequest {
    
    private String sessionId; // Optional: for resuming existing session
    
    private String guestName; // Optional: guest can provide name
    
    @Email(message = "Email không hợp lệ")
    private String guestEmail; // Optional: for follow-up
    
    private String contextType; // EVENT_PLANNING, GENERAL_INQUIRY, etc.
    
    private String contextId; // EventPlanner ID if applicable
}

