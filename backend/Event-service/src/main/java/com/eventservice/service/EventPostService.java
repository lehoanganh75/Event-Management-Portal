package com.eventservice.service;

import com.eventservice.dto.social.response.EventPostDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import com.eventservice.dto.social.request.EventPostRequest;
import com.eventservice.dto.social.response.EventPostResponse;
import com.eventservice.entity.social.EventPost;
import com.eventservice.entity.enums.PostStatus;

import java.util.List;

public interface EventPostService {
    // 1. Tìm kiếm và Lọc (Search & Filter)
    Page<EventPost> getAllPosts(String title, PostStatus status, Pageable pageable);


    List<EventPostDetailResponse> getPostsByEvent(String eventId);

    EventPostDetailResponse getPostDetail(String id);

    // 3. Thêm mới bài viết
    @Transactional
    EventPost createPost(EventPost post);

    // 4. Cập nhật bài viết
    @Transactional
    EventPost updatePost(String id, EventPostRequest postDto);

    // 5. Xóa bài viết (Soft Delete)
    @Transactional
    void deletePost(String id);

    @Transactional
    EventPost reactToPost(String postId, String accountId, String emoji);

    List<EventPostResponse> getPostsByAccountId(String accountId);

    List<EventPostResponse> getPostsByAccountIdAndEventId(String accountId, String eventId);

    @Transactional
    EventPost createPost(EventPostRequest postDto);
}
