package com.eventservice.service;

import com.eventservice.entity.social.PostComment;
import java.util.List;

public interface PostCommentService {
    PostComment createComment(String postId, String accountId, String content, String parentId);
    List<PostComment> getCommentsByPost(String postId);
    void deleteComment(String commentId);
    PostComment reactToComment(String commentId, String accountId, String emoji);
}
