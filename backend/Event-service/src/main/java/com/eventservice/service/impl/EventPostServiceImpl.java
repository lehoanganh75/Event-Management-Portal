package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
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
import com.eventservice.entity.social.PostComment;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.social.EventPost;
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
    public List<EventPostDetailResponse> getPostsByEvent(String eventId) {
        List<EventPost> eventPosts = eventPostRepository.findByEventIdAndIsDeletedFalse(eventId);
        if (eventPosts.isEmpty())
            return Collections.emptyList();

        // 1. Gom tất cả Account IDs từ TẤT CẢ các bài post để gọi Identity 1 lần duy
        // nhất
        Set<String> allAccountIds = new HashSet<>();
        for (EventPost post : eventPosts) {
            allAccountIds.add(post.getAuthorAccountId());
            collectAccountIds(post.getComments(), allAccountIds);
        }

        // 2. Fetch User Map (Batching)
        Map<String, UserResponse> userMap = fetchUsersMap(allAccountIds);

        // 3. Map sang DTO
        return eventPosts.stream()
                .map(post -> mapToPostDetailResponse(post, userMap))
                .collect(Collectors.toList());
    }

    @Override
    public EventPostDetailResponse getPostDetail(String id) {
        EventPost post = eventPostRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        Set<String> accountIds = new HashSet<>();
        accountIds.add(post.getAuthorAccountId());
        collectAccountIds(post.getComments(), accountIds);

        Map<String, UserResponse> userMap = fetchUsersMap(accountIds);

        return mapToPostDetailResponse(post, userMap);
    }

    // --- PRIVATE HELPER METHODS (Dùng chung cho cả 2 method trên) ---

    /**
     * Hàm trung tâm để chuyển đổi từ Entity sang DTO
     */
    private EventPostDetailResponse mapToPostDetailResponse(EventPost post, Map<String, UserResponse> userMap) {
        EventPostDetailResponse res = new EventPostDetailResponse();
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
        res.setImageUrls(post.getImageUrls());
        res.setReactions(post.getReactions());

        if (post.getEvent() != null) {
            res.setEventId(post.getEvent().getId());
            res.setEventTitle(post.getEvent().getTitle());
        }

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
        if (comments == null)
            return;
        for (PostComment c : comments) {
            ids.add(c.getCommenterAccountId());
            if (c.getReplies() != null)
                collectAccountIds(c.getReplies(), ids);
        }
    }

    // Hàm lookup User từ Map (Không gọi API nữa nên rất nhanh và an toàn)
    private PostCommentResponse convertToCommentDto(PostComment comment, Map<String, UserResponse> userMap) {
        PostCommentResponse dto = new PostCommentResponse();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setReactions(comment.getReactions());

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
    private UserResponse getDefaultUser(String id) {
        UserResponse user = new UserResponse();
        user.setId(id);
        user.setFullName("Người dùng hệ thống");
        user.setAvatarUrl("default-avatar-url.png"); // Đường dẫn ảnh mặc định
        return user;
    }

    private Map<String, UserResponse> fetchUsersMap(Set<String> ids) {
        if (ids == null || ids.isEmpty())
            return new HashMap<>();
        try {
            List<UserResponse> users = identityServiceClient.getUsersByIds(new ArrayList<>(ids));
            Map<String, UserResponse> map = new HashMap<>();
            if (users != null) {
                for (UserResponse u : users) {
                    if (u != null && u.getId() != null)
                        map.put(u.getId(), u);
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

        // if (post.getStatus() == PostStatus.PUBLISHED) {
        // post.setPostAt(LocalDateTime.now());
        // }

        return eventPostRepository.save(post);
    }

    @Transactional
    @Override
    public EventPost updatePost(String id, EventPostRequest postDto) {
        EventPost existingPost = eventPostRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        existingPost.setTitle(postDto.getTitle());
        existingPost.setContent(postDto.getContent());
        existingPost.setPostType(postDto.getPostType());
        existingPost.setImageUrls(postDto.getImageUrls() != null ? postDto.getImageUrls() : new ArrayList<>());
        existingPost.setUpdatedAt(LocalDateTime.now());

        if (existingPost.getStatus() != PostStatus.PUBLISHED && postDto.getStatus() == PostStatus.PUBLISHED) {
            existingPost.setPublishedAt(LocalDateTime.now());
        }
        existingPost.setStatus(postDto.getStatus());

        if (postDto.getEventId() != null) {
            Event event = eventRepository.findById(postDto.getEventId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));
            existingPost.setEvent(event);
        }

        return eventPostRepository.save(existingPost);
    }

    @Transactional
    @Override
    public void deletePost(String id) {
        EventPost post = eventPostRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));
        post.setDeleted(true);
        post.setUpdatedAt(LocalDateTime.now());
        eventPostRepository.save(post);
    }

    @Override
    public List<EventPostResponse> getPostsByAccountId(String accountId) {
        List<EventPost> posts = eventPostRepository.findByAuthorAccountIdOrderByCreatedAtDesc(accountId);

        return posts.stream().map(post -> {
            return EventPostResponse.from(post, null);
        }).collect(Collectors.toList());
    }

    @Override
    public List<EventPostResponse> getPostsByAccountIdAndEventId(String accountId, String eventId) {
        List<EventPost> posts = eventPostRepository.findByAuthorAccountIdAndEventId(accountId, eventId);

        return posts.stream().map(post -> {
            return EventPostResponse.from(post, null);
        }).collect(Collectors.toList());
    }

    @Transactional
    @Override
    public EventPost createPost(EventPostRequest postDto) {
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
        post.setAuthorAccountId(postDto.getAccountId());
        post.setPublishedAt(postDto.getPublishedAt() != null ? postDto.getPublishedAt() : LocalDateTime.now());

        if (post.getSlug() == null) {
            post.setSlug(postDto.getTitle().toLowerCase()
                    .replaceAll("[^a-z0-9\\s]", "")
                    .replaceAll("\\s+", "-") + "-" + System.currentTimeMillis());
        }

        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setDeleted(false);
        post.setImageUrls(postDto.getImageUrls() != null ? postDto.getImageUrls() : new ArrayList<>());

        return eventPostRepository.save(post);
    }

    @Transactional
    @Override
    public EventPost reactToPost(String postId, String accountId, String emoji) {
        EventPost post = eventPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        Map<String, String> reactions = post.getReactions();
        if (reactions == null)
            reactions = new HashMap<>();

        if (emoji == null || emoji.equals(reactions.get(accountId))) {
            reactions.remove(accountId);
        } else {
            reactions.put(accountId, emoji);
        }

        post.setReactions(reactions);
        return eventPostRepository.save(post);
    }
}

