package com.eventservice.service.engagement;

import com.eventservice.dto.engagement.request.EventFeedbackRequest;
import com.eventservice.dto.engagement.response.EventFeedbackResponse;
import java.util.List;

public interface EventFeedbackService {
    EventFeedbackResponse submitFeedback(String eventId, EventFeedbackRequest request);
    List<EventFeedbackResponse> getFeedbacksByEvent(String eventId);
    EventFeedbackResponse replyToFeedback(String feedbackId, String reply);
}
