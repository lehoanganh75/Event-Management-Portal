package com.eventservice.service;

import com.eventservice.dto.PostDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import com.eventservice.dto.PostRequestDto;
import com.eventservice.dto.PostResponseDto;
import com.eventservice.entity.EventPost;
import com.eventservice.entity.enums.PostStatus;

import java.util.List;

public interface EventPostService {
    // 1. Tìm kiếm và Lọc (Search & Filter)
    Page<PostDetailResponse> getAllPosts(String title, PostStatus status, Pageable pageable);


    List<PostDetailResponse> getPostsByEvent(String eventId);

    PostDetailResponse getPostDetail(String id);

    // 3. Thêm mới bài viết
    @Transactional
    EventPost createPost(EventPost post);

    // 4. Cập nhật bài viết
    @Transactional
    EventPost updatePost(String id, PostRequestDto postDto);

    // 5. Xóa bài viết (Soft Delete)
    @Transactional
    void deletePost(String id);

    @Transactional
    EventPost reactToPost(String postId, String accountId, String emoji);

    List<PostResponseDto> getPostsByAccountId(String accountId);

    List<PostResponseDto> getPostsByAccountIdAndEventId(String accountId, String eventId);

    @Transactional
    EventPost createPost(PostRequestDto postDto);
}
