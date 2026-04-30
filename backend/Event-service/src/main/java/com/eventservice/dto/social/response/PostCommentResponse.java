package com.eventservice.dto.social.response;

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

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostCommentResponse {
    private String id;
    private String content;
    private UserResponse commenter; // Thông tin người bình luận
    private LocalDateTime createdAt;
    private List<PostCommentResponse> replies;
    private java.util.Map<String, String> reactions;
}

