package src.main.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.repository.EventPostRepository;
import src.main.eventservice.service.EventPostService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventPostServiceImpl implements EventPostService {

    private final EventPostRepository eventPostRepository;

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

        if (post.getStatus() == PostStatus.Published) {
            post.setPublishedAt(LocalDateTime.now());
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

        if (existingPost.getStatus() != PostStatus.Published && postDetails.getStatus() == PostStatus.Published) {
            existingPost.setPublishedAt(LocalDateTime.now());
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
}