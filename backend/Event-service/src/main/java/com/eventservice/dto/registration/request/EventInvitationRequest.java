package com.eventservice.dto.registration.request;

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

import com.eventservice.entity.enums.OrganizerRole;
import lombok.Data;

import java.util.List;

@Data
public class EventInvitationRequest {
    private List<String> inviteeIds;
    private OrganizerRole targetRole;
    private String message;
}

