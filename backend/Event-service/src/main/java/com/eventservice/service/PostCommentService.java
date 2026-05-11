package com.eventservice.service;

import com.eventservice.entity.social.PostComment;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface PostCommentService {
    PostComment createComment(String postId, String accountId, String content, String parentId, List<MultipartFile> images, boolean isAnonymous, String anonymousIdentity);
    List<PostComment> getCommentsByPost(String postId, String accountId);
    void deleteComment(String commentId);
    PostComment reactToComment(String commentId, String accountId, String emoji);
}
