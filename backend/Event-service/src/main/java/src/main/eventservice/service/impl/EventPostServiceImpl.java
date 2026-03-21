package src.main.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.dto.PostRequestDto;
import src.main.eventservice.dto.PostResponseDto;
import src.main.eventservice.entity.Event;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.repository.EventPostRepository;
import src.main.eventservice.repository.EventRepository;
import src.main.eventservice.service.EventPostService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventPostServiceImpl implements EventPostService {

    private final EventPostRepository eventPostRepository;
    private final EventRepository eventRepository;

    private static final Logger log = LoggerFactory.getLogger(EventPostServiceImpl.class);

    @Override
    public Page<EventPost> getAllPosts(String title, PostStatus status, Pageable pageable) {
        return eventPostRepository.findAllWithFilters(title, status, pageable);
    }

    @Override
    public EventPost getPostById(String id) {
        return eventPostRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết hoặc bài viết đã bị xóa!"));
    }

    @Transactional
    @Override
    public EventPost createPost(EventPost post) {
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setDeleted(false);

        if (post.getStatus() == PostStatus.PUBLISHED) {
            post.setPostAt(LocalDateTime.now());
        }

        return eventPostRepository.save(post);
    }

    @Transactional
    @Override
    public EventPost updatePost(String id, EventPost postDetails) {
        EventPost existingPost = getPostById(id);

        existingPost.setTitle(postDetails.getTitle());
        existingPost.setContent(postDetails.getContent());
        existingPost.setPostType(postDetails.getPostType());
        existingPost.setUpdatedAt(LocalDateTime.now());

        if (existingPost.getStatus() != PostStatus.PUBLISHED && postDetails.getStatus() == PostStatus.PUBLISHED) {
            existingPost.setPostAt(LocalDateTime.now());
        }
        existingPost.setStatus(postDetails.getStatus());

        return eventPostRepository.save(existingPost);
    }

    @Transactional
    @Override
    public void deletePost(String id) {
        EventPost post = getPostById(id);
        post.setDeleted(true);
        post.setUpdatedAt(LocalDateTime.now());
        eventPostRepository.save(post);
    }

    @Override
    public List<PostResponseDto> getPostsByAccountId(String accountId) {
        List<EventPost> posts = eventPostRepository.findByCreatedByAccountIdOrderByCreatedAtDesc(accountId);

        return posts.stream().map(post -> {
            return PostResponseDto.from(post, null);
        }).collect(Collectors.toList());
    }

    @Override
    public List<PostResponseDto> getPostsByAccountIdAndEventId(String accountId, String eventId) {
        List<EventPost> posts = eventPostRepository.findByCreatedByAccountIdAndEventId(accountId, eventId);

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
        post.setCreatedByAccountId(postDto.getAccountId());
        post.setPostAt(postDto.getPublishedAt());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setDeleted(false);

        return eventPostRepository.save(post);
    }
}