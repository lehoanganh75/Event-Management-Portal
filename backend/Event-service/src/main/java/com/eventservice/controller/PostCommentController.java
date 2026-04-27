package com.eventservice.controller;

import com.eventservice.entity.PostComment;
import com.eventservice.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/posts/comments")
@RequiredArgsConstructor
public class PostCommentController {

    private final PostCommentService postCommentService;

    @PostMapping("/{postId}")
    public ResponseEntity<PostComment> createComment(
            @PathVariable String postId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt) {
        
        String accountId = jwt.getSubject();
        String content = request.get("content");
        String parentId = request.get("parentId");
        
        return ResponseEntity.ok(postCommentService.createComment(postId, accountId, content, parentId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<PostComment>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(postCommentService.getCommentsByPost(postId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        postCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/react")
    public ResponseEntity<PostComment> reactToComment(
            @PathVariable String commentId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        String emoji = request.get("emoji");
        return ResponseEntity.ok(postCommentService.reactToComment(commentId, accountId, emoji));
    }
}
