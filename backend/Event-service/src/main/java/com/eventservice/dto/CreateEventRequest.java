package com.eventservice.dto;

import com.eventservice.entity.Event;
import com.eventservice.entity.EventInvitation;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class CreateEventRequest {

    private Event event;

    private List<String> organizerIds;
    private List<Map<String, Object>> presenterIds; // Danh sách {accountId, bio, session}

    // Lời mời gửi đi ngay khi tạo event
    private List<Map<String, Object>> invitations;
}
