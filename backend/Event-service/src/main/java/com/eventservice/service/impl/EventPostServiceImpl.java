package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.*;
import com.eventservice.entity.PostComment;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eventservice.entity.Event;
import com.eventservice.entity.EventPost;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.repository.EventPostRepository;
import com.eventservice.repository.EventRepository;
import com.eventservice.service.EventPostService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventPostServiceImpl implements EventPostService {

    private final EventPostRepository eventPostRepository;
    private final EventRepository eventRepository;
    private final IdentityServiceClient identityServiceClient;

    @Override
    public Page<EventPost> getAllPosts(String title, PostStatus status, Pageable pageable) {
        return eventPostRepository.findAllWithFilters(title, status, pageable);
    }

    @Override
    public List<PostDetailResponse> getPostsByEvent(String eventId) {
        List<EventPost> eventPosts = eventPostRepository.findByEventIdAndIsDeletedFalse(eventId);
        if (eventPosts.isEmpty()) return Collections.emptyList();

        // 1. Gom tất cả Account IDs từ TẤT CẢ các bài post để gọi Identity 1 lần duy nhất
        Set<String> allAccountIds = new HashSet<>();
        for (EventPost post : eventPosts) {
            allAccountIds.add(post.getAuthorAccountId());
            collectAccountIds(post.getComments(), allAccountIds);
        }

        // 2. Fetch User Map (Batching)
        Map<String, UserDto> userMap = fetchUsersMap(allAccountIds);

        // 3. Map sang DTO
        return eventPosts.stream()
                .map(post -> mapToPostDetailResponse(post, userMap))
                .collect(Collectors.toList());
    }

    @Override
    public PostDetailResponse getPostDetail(String id) {
        EventPost post = eventPostRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        Set<String> accountIds = new HashSet<>();
        accountIds.add(post.getAuthorAccountId());
        collectAccountIds(post.getComments(), accountIds);

        Map<String, UserDto> userMap = fetchUsersMap(accountIds);

        return mapToPostDetailResponse(post, userMap);
    }

// --- PRIVATE HELPER METHODS (Dùng chung cho cả 2 method trên) ---

    /**
     * Hàm trung tâm để chuyển đổi từ Entity sang DTO
     */
    private PostDetailResponse mapToPostDetailResponse(EventPost post, Map<String, UserDto> userMap) {
        PostDetailResponse res = new PostDetailResponse();
        // Copy properties đơn giản
        res.setId(post.getId());
        res.setSlug(post.getSlug());
        res.setTitle(post.getTitle());
        res.setContent(post.getContent());
        res.setPostType(post.getPostType());
        res.setStatus(post.getStatus());
        res.setPinned(post.isPinned());
        res.setAllowComments(post.isAllowComments());
        res.setViewCount(post.getViewCount());
        res.setPublishedAt(post.getPublishedAt());
        res.setCreatedAt(post.getCreatedAt());
        res.setUpdatedAt(post.getUpdatedAt());
        res.setDeleted(post.isDeleted());

        // Mapping Author
        res.setAuthor(userMap.getOrDefault(post.getAuthorAccountId(), getDefaultUser(post.getAuthorAccountId())));

        // Mapping Comments (Chỉ lấy comment cha)
        if (post.getComments() != null) {
            res.setComments(post.getComments().stream()
                    .filter(c -> c.getParentComment() == null)
                    .map(c -> convertToCommentDto(c, userMap))
                    .collect(Collectors.toList()));
        }

        return res;
    }

    // Hàm bổ trợ để gom ID
    private void collectAccountIds(List<PostComment> comments, Set<String> ids) {
        if (comments == null) return;
        for (PostComment c : comments) {
            ids.add(c.getCommenterAccountId());
            if (c.getReplies() != null) collectAccountIds(c.getReplies(), ids);
        }
    }

    // Hàm lookup User từ Map (Không gọi API nữa nên rất nhanh và an toàn)
    private CommentResponse convertToCommentDto(PostComment comment, Map<String, UserDto> userMap) {
        CommentResponse dto = new CommentResponse();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());

        // Lấy từ Map, nếu null thì tạo User mặc định tránh lỗi UI
        dto.setCommenter(userMap.getOrDefault(comment.getCommenterAccountId(),
                getDefaultUser(comment.getCommenterAccountId())));

        if (comment.getReplies() != null) {
            dto.setReplies(comment.getReplies().stream()
                    .map(r -> convertToCommentDto(r, userMap))
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // User mặc định khi Identity Service lỗi hoặc không tìm thấy profile
    private UserDto getDefaultUser(String id) {
        UserDto user = new UserDto();
        user.setId(id);
        user.setFullName("Người dùng hệ thống");
        user.setAvatarUrl("default-avatar-url.png"); // Đường dẫn ảnh mặc định
        return user;
    }

    private Map<String, UserDto> fetchUsersMap(Set<String> ids) {
        try {
            // Tốt nhất là tạo API lấy List User: identityServiceClient.getUsersByIds(ids)
            // Nếu chỉ có API lấy từng người, hãy loop ở đây nhưng bọc try-catch kỹ
            Map<String, UserDto> map = new HashMap<>();
            for (String id : ids) {
                try {
                    UserDto user = identityServiceClient.getUsersById(id);
                    if (user != null) map.put(id, user);
                } catch (Exception e) {
                }
            }
            return map;
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    @Transactional
    @Override
    public EventPost createPost(EventPost post) {
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setDeleted(false);

//        if (post.getStatus() == PostStatus.PUBLISHED) {
//            post.setPostAt(LocalDateTime.now());
//        }

        return eventPostRepository.save(post);
    }

    @Transactional
    @Override
    public EventPost updatePost(String id, EventPost postDetails) {
//        EventPost existingPost = getPostDetail(id);
//
//        existingPost.setTitle(postDetails.getTitle());
//        existingPost.setContent(postDetails.getContent());
//        existingPost.setPostType(postDetails.getPostType());
//        existingPost.setUpdatedAt(LocalDateTime.now());
//
//        if (existingPost.getStatus() != PostStatus.PUBLISHED && postDetails.getStatus() == PostStatus.PUBLISHED) {
//            existingPost.setPostAt(LocalDateTime.now());
//        }
//        existingPost.setStatus(postDetails.getStatus());
//
//        return eventPostRepository.save(existingPost);
        return null;

    }

    @Transactional
    @Override
    public void deletePost(String id) {
//        EventPost post = getPostById(id);
//        post.setDeleted(true);
//        post.setUpdatedAt(LocalDateTime.now());
//        eventPostRepository.save(post);
    }

    @Override
    public List<PostResponseDto> getPostsByAccountId(String accountId) {
        List<EventPost> posts = eventPostRepository.findByAuthorAccountIdOrderByCreatedAtDesc(accountId);

        return posts.stream().map(post -> {
            return PostResponseDto.from(post, null);
        }).collect(Collectors.toList());
    }

    @Override
    public List<PostResponseDto> getPostsByAccountIdAndEventId(String accountId, String eventId) {
        List<EventPost> posts = eventPostRepository.findByAuthorAccountIdAndEventId(accountId, eventId);

        return posts.stream().map(post -> {
            return PostResponseDto.from(post, null);
        }).collect(Collectors.toList());
    }

    @Transactional
    @Override
    public EventPost createPost(PostRequestDto postDto) {
        EventPost post = new EventPost();

        if (postDto.getEventId() != null) {
            Event event = eventRepository.findById(postDto.getEventId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));
            post.setEvent(event);
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setPostType(postDto.getPostType());
        post.setStatus(postDto.getStatus());
//        post.setCreatedByAccountId(postDto.getAccountId());
//        post.setPostAt(postDto.getPublishedAt());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setDeleted(false);

        return eventPostRepository.save(post);
    }
}