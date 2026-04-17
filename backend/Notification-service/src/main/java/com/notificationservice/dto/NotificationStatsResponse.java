package com.notificationservice.dto;

import com.notificationservice.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class NotificationStatsResponse {
    private long total;
    private long unread;
    private long read;
    private Map<NotificationType, Long> statsByType;
}