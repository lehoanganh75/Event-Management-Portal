package com.eventservice.service.impl;

import com.eventservice.client.IdentityServiceClient;
import com.eventservice.dto.user.UserResponse;
import com.eventservice.entity.social.EventPost;
import com.eventservice.entity.social.PostComment;
import com.eventservice.dto.social.response.PostInteractionEvent;
import com.eventservice.repository.EventPostRepository;
import com.eventservice.repository.PostCommentRepository;
import com.eventservice.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final SimpMessagingTemplate messagingTemplate;
    private final com.eventservice.service.S3Service s3Service;
    private final com.eventservice.kafka.NotificationProducer notificationProducer;
    private final GeminiAIService geminiAIService;

    @Override
    @Transactional
    public PostComment createComment(String postId, String accountId, String content, String parentId, List<org.springframework.web.multipart.MultipartFile> images, boolean isAnonymous, String anonymousIdentity) {
        System.out.println("DEBUG: Creating comment - isAnonymous: " + isAnonymous + ", identity: " + anonymousIdentity);
        
        // AI Content Moderation
        if (content != null && !content.trim().isEmpty() && geminiAIService.isContentOffensive(content)) {
            throw new RuntimeException("Nội dung bình luận vi phạm chuẩn mực cộng đồng (chứa từ ngữ khiếm nhã/tiêu cực).");
        }

        EventPost post = eventPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            imageUrls = images.stream()
                    .map(s3Service::uploadFile)
                    .collect(Collectors.toList());
        }

        PostComment comment = PostComment.builder()
                .post(post)
                .commenterAccountId(accountId)
                .content(content)
                .isDeleted(false)
                .isEdited(false)
                .anonymous(isAnonymous)
                .anonymousIdentity(anonymousIdentity)
                .imageUrls(imageUrls)
                .build();

        if (parentId != null) {
            PostComment parent = postCommentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Bình luận cha không tồn tại!"));
            comment.setParentComment(parent);
        }

        PostComment saved = postCommentRepository.save(comment);
        if (saved.getCreatedAt() == null) saved.setCreatedAt(java.time.LocalDateTime.now());
        if (parentId != null) saved.setParentId(parentId);
        enrichComment(saved);

        // Broadcast comment update
        messagingTemplate.convertAndSend("/topic/posts/" + postId,
                PostInteractionEvent.builder()
                        .postId(postId)
                        .type(PostInteractionEvent.Type.COMMENT)
                        .data(createSafeBroadcastComment(saved))
                        .build());

        // --- Notification Logic ---
        try {
            String senderName = isAnonymous ? (anonymousIdentity != null ? anonymousIdentity : "Người dùng ẩn danh") 
                                           : (saved.getAuthor() != null ? saved.getAuthor().getFullName() : "Ai đó");
            String recipientId = null;
            String message = "";
            String title = "Bình luận mới";

            if (parentId == null) {
                // New parent comment -> Notify post author
                recipientId = post.getAuthorAccountId();
                message = senderName + " đã bình luận về bài viết của bạn: \"" + post.getTitle() + "\"";
            } else {
                // New reply -> Notify parent comment author
                PostComment parent = postCommentRepository.findById(parentId).orElse(null);
                if (parent != null) {
                    recipientId = parent.getCommenterAccountId();
                    message = senderName + " đã phản hồi bình luận của bạn trong bài viết \"" + post.getTitle() + "\"";
                    title = "Phản hồi mới";
                }
            }

            // Only send if recipient is not the sender
            if (recipientId != null && !recipientId.equals(accountId)) {
                notificationProducer.sendNotification(com.eventservice.dto.engagement.NotificationEventDto.builder()
                        .recipientId(recipientId)
                        .senderId(isAnonymous ? null : accountId)
                        .title(title)
                        .message(message)
                        .type("COMMENT")
                        .relatedEntityId(postId)
                        .actionUrl("/posts/" + postId)
                        .build());
            }
        } catch (Exception e) {
            // Log error but don't fail comment creation
        }

        return saved;
    }

    @Override
    public List<PostComment> getCommentsByPost(String postId, String accountId) {
        List<PostComment> comments = postCommentRepository.findByPostIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(postId);
        enrichComments(comments);
        scrubAnonymousIdentities(comments, accountId);
        return comments;
    }

    private void scrubAnonymousIdentities(List<PostComment> comments, String currentAccountId) {
        if (comments == null) return;
        for (PostComment c : comments) {
            if (c.isAnonymous() && (currentAccountId == null || !currentAccountId.equals(c.getCommenterAccountId()))) {
                c.setCommenterAccountId(null);
                c.setAuthor(null);
            }
            if (c.getReplies() != null) {
                scrubAnonymousIdentities(c.getReplies(), currentAccountId);
            }
        }
    }

    private PostComment createSafeBroadcastComment(PostComment original) {
        PostComment safe = new PostComment();
        safe.setId(original.getId());
        safe.setContent(original.getContent());
        safe.setAnonymous(original.isAnonymous());
        safe.setAnonymousIdentity(original.getAnonymousIdentity());
        safe.setImageUrls(original.getImageUrls());
        safe.setReactions(original.getReactions());
        safe.setIsEdited(original.getIsEdited());
        safe.setIsDeleted(original.getIsDeleted());
        safe.setCreatedAt(original.getCreatedAt());
        safe.setUpdatedAt(original.getUpdatedAt());
        safe.setParentId(original.getParentId());
        
        if (!original.isAnonymous()) {
            safe.setCommenterAccountId(original.getCommenterAccountId());
            safe.setAuthor(original.getAuthor());
        }
        return safe;
    }

    private void enrichComments(List<PostComment> comments) {
        if (comments.isEmpty()) return;
        
        Set<String> ids = new HashSet<>();
        collectIds(comments, ids);
        
        Map<String, UserResponse> userMap = fetchUsersMap(ids);
        
        applyUsers(comments, userMap);
    }

    private void enrichComment(PostComment comment) {
        if (comment == null) return;
        enrichComments(Collections.singletonList(comment));
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
            if (ids == null || ids.isEmpty()) {
                return new HashMap<>();
            }
            List<String> validIds = ids.stream()
                    .filter(id -> id != null && !id.trim().isEmpty())
                    .collect(Collectors.toList());
            if (validIds.isEmpty()) {
                return new HashMap<>();
            }
            List<UserResponse> users = identityServiceClient.getUsersByIds(validIds);
            Map<String, UserResponse> map = new HashMap<>();
            if (users != null) {
                for (UserResponse u : users) {
                    if (u != null && u.getId() != null) {
                        map.put(u.getId(), u);
                    }
                }
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
        comment.setIsDeleted(true);
        PostComment saved = postCommentRepository.save(comment);

        // Broadcast deletion
        messagingTemplate.convertAndSend("/topic/posts/" + comment.getPost().getId(),
                PostInteractionEvent.builder()
                        .postId(comment.getPost().getId())
                        .type(PostInteractionEvent.Type.COMMENT_DELETE)
                        .data(commentId) // Send the ID to be removed
                        .build());
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
        PostComment saved = postCommentRepository.save(comment);
        if (saved.getParentComment() != null) saved.setParentId(saved.getParentComment().getId());
        enrichComment(saved);

        // Broadcast reaction
        messagingTemplate.convertAndSend("/topic/posts/" + saved.getPost().getId(),
                PostInteractionEvent.builder()
                        .postId(saved.getPost().getId())
                        .type(PostInteractionEvent.Type.COMMENT_LIKE)
                        .data(createSafeBroadcastComment(saved))
                        .build());

        return saved;
    }
}
