package com.eventservice.dto.core.request;

import com.eventservice.entity.core.Event;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class EventCreateRequest {

    private Event event;

    private List<String> organizerIds;
    private List<Map<String, Object>> presenterIds; // Danh sách {accountId, bio, session}

    // Lời mời gửi đi ngay khi tạo event
    private List<Map<String, Object>> invitations;
}
