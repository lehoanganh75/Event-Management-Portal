package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.UserDto;
import com.eventservice.entity.EventPost;
import com.eventservice.entity.PostComment;
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
        List<PostComment> comments = postCommentRepository
                .findByPostIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(postId);
        enrichComments(comments);
        return comments;
    }

    private void enrichComments(List<PostComment> comments) {
        if (comments.isEmpty())
            return;

        Set<String> ids = new HashSet<>();
        collectIds(comments, ids);

        Map<String, UserDto> userMap = fetchUsersMap(ids);

        applyUsers(comments, userMap);
    }

    private void enrichComment(PostComment comment) {
        try {
            List<UserDto> users = identityServiceClient
                    .getUsersByIds(Collections.singletonList(comment.getCommenterAccountId()));
            if (users != null && !users.isEmpty()) {
                comment.setAuthor(users.get(0));
            } else {
                comment.setAuthor(getDefaultUser(comment.getCommenterAccountId()));
            }
        } catch (Exception e) {
            comment.setAuthor(getDefaultUser(comment.getCommenterAccountId()));
        }
    }

    private void collectIds(List<PostComment> comments, Set<String> ids) {
        for (PostComment c : comments) {
            if (c.getCommenterAccountId() != null) {
                ids.add(c.getCommenterAccountId());
            }
            if (c.getReplies() != null)
                collectIds(c.getReplies(), ids);
        }
    }

    private void applyUsers(List<PostComment> comments, Map<String, UserDto> userMap) {
        for (PostComment c : comments) {
            UserDto user = userMap.get(c.getCommenterAccountId());
            if (user == null) {
                user = getDefaultUser(c.getCommenterAccountId());
            }
            c.setAuthor(user);
            if (c.getReplies() != null)
                applyUsers(c.getReplies(), userMap);
        }
    }

    private Map<String, UserDto> fetchUsersMap(Set<String> ids) {
        if (ids == null || ids.isEmpty())
            return new HashMap<>();
        try {
            List<UserDto> users = identityServiceClient.getUsersByIds(new ArrayList<>(ids));
            Map<String, UserDto> map = new HashMap<>();
            if (users != null) {
                for (UserDto u : users) {
                    if (u != null && u.getId() != null)
                        map.put(u.getId(), u);
                }
            }
            return map;
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private UserDto getDefaultUser(String id) {
        UserDto user = new UserDto();
        user.setId(id);
        user.setFullName("Người dùng hệ thống");
        user.setAvatarUrl("default-avatar-url.png");
        return user;
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
        if (reactions == null)
            reactions = new HashMap<>();

        if (emoji == null || emoji.equals(reactions.get(accountId))) {
            reactions.remove(accountId);
        } else {
            reactions.put(accountId, emoji);
        }

        comment.setReactions(reactions);
        return postCommentRepository.save(comment);
    }
}
