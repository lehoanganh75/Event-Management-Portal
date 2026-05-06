package com.analyticsservice.service;

import com.analyticsservice.entity.EventSummaryReport;

public interface AISummaryService {
    EventSummaryReport generateSummary(String eventId);

    EventSummaryReport getSummaryByEventId(String eventId);

    byte[] exportToWord(String eventId);
}
