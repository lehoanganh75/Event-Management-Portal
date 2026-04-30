package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.social.EventPost;
import com.eventservice.entity.social.PostComment;
import com.eventservice.repository.EventPostRepository;
import com.eventservice.repository.PostCommentRepository;
import com.eventservice.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostCommentServiceImpl implements PostCommentService {

    private final PostCommentRepository postCommentRepository;
    private final EventPostRepository eventPostRepository;
    private final IdentityServiceClient identityServiceClient;

    @Override
    @Transactional
    public PostComment createComment(String postId, String accountId, String content, String parentId) {
        EventPost post = eventPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        PostComment comment = PostComment.builder()
                .post(post)
                .commenterAccountId(accountId)
                .content(content)
                .isDeleted(false)
                .isEdited(false)
                .build();

        if (parentId != null) {
            PostComment parent = postCommentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Bình luận cha không tồn tại!"));
            comment.setParentComment(parent);
        }

        PostComment saved = postCommentRepository.save(comment);
        enrichComment(saved);
        return saved;
    }

    @Override
    public List<PostComment> getCommentsByPost(String postId) {
        List<PostComment> comments = postCommentRepository.findByPostIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(postId);
        enrichComments(comments);
        return comments;
    }

    private void enrichComments(List<PostComment> comments) {
        if (comments.isEmpty()) return;
        
        Set<String> ids = new HashSet<>();
        collectIds(comments, ids);
        
        Map<String, UserResponse> userMap = fetchUsersMap(ids);
        
        applyUsers(comments, userMap);
    }

    private void enrichComment(PostComment comment) {
        UserResponse user = identityServiceClient.getUsersById(comment.getCommenterAccountId());
        comment.setAuthor(user);
    }

    private void collectIds(List<PostComment> comments, Set<String> ids) {
        for (PostComment c : comments) {
            ids.add(c.getCommenterAccountId());
            if (c.getReplies() != null) collectIds(c.getReplies(), ids);
        }
    }

    private void applyUsers(List<PostComment> comments, Map<String, UserResponse> userMap) {
        for (PostComment c : comments) {
            c.setAuthor(userMap.get(c.getCommenterAccountId()));
            if (c.getReplies() != null) applyUsers(c.getReplies(), userMap);
        }
    }

    private Map<String, UserResponse> fetchUsersMap(Set<String> ids) {
        try {
            Map<String, UserResponse> map = new HashMap<>();
            for (String id : ids) {
                try {
                    UserResponse user = identityServiceClient.getUsersById(id);
                    if (user != null) map.put(id, user);
                } catch (Exception e) {}
            }
            return map;
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    @Override
    @Transactional
    public void deleteComment(String commentId) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại!"));
        comment.setDeleted(true);
        postCommentRepository.save(comment);
    }
    @Override
    @Transactional
    public PostComment reactToComment(String commentId, String accountId, String emoji) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại!"));
        
        Map<String, String> reactions = comment.getReactions();
        if (reactions == null) reactions = new HashMap<>();
        
        if (emoji == null || emoji.equals(reactions.get(accountId))) {
            reactions.remove(accountId);
        } else {
            reactions.put(accountId, emoji);
        }
        
        comment.setReactions(reactions);
        return postCommentRepository.save(comment);
    }
}
