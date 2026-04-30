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

import lombok.Data;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.entity.enums.PostType;

import java.util.List;
import java.time.LocalDateTime;

@Data
public class EventPostRequest {
    private String title;
    private String content;
    private PostType postType;
    private PostStatus status;
    private String eventId;
    private String accountId;
    private List<String> imageUrls;
    private LocalDateTime publishedAt;
}

