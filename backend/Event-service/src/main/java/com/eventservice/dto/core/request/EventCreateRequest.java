package com.eventservice.dto.core.request;

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

import com.eventservice.entity.core.Event;
import com.eventservice.entity.registration.EventInvitation;
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

