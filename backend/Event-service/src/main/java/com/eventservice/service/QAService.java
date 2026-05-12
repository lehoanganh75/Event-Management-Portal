package com.eventservice.service;

import com.eventservice.dto.engagement.QAMessageDto;
import java.util.List;

public interface QAService {
    QAMessageDto postMessage(QAMessageDto messageDto);
    QAMessageDto answerMessage(String messageId, String answerContent, String adminId, String adminName);
    List<QAMessageDto> getMessagesByEvent(String eventId, boolean includeHidden);
    QAMessageDto upvoteMessage(String messageId);
    void deleteMessage(String messageId);
}
