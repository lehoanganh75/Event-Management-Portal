package com.eventservice.dto.social.request;

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
