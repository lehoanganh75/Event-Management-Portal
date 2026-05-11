package com.eventservice.controller;

import com.eventservice.entity.social.PostComment;
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

    @PostMapping(value = "/{postId}", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostComment> createCommentJson(
            @PathVariable String postId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {

        String accountId = jwt.getSubject();
        String content = request.get("content") != null ? String.valueOf(request.get("content")) : null;
        String parentId = request.get("parentId") != null ? String.valueOf(request.get("parentId")) : null;
        boolean isAnonymous = request.get("isAnonymous") != null && (boolean) request.get("isAnonymous");
        String anonymousIdentity = request.get("anonymousIdentity") != null ? String.valueOf(request.get("anonymousIdentity")) : null;

        return ResponseEntity.ok(postCommentService.createComment(postId, accountId, content, parentId, null, isAnonymous, anonymousIdentity));
    }

    @PostMapping(value = "/{postId}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostComment> createCommentMultipart(
            @PathVariable String postId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "parentId", required = false) String parentId,
            @RequestParam(value = "isAnonymous", required = false, defaultValue = "false") boolean isAnonymous,
            @RequestParam(value = "anonymousIdentity", required = false) String anonymousIdentity,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images,
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {

        String accountId = jwt.getSubject();

        return ResponseEntity.ok(postCommentService.createComment(postId, accountId, content, parentId, images, isAnonymous, anonymousIdentity));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<PostComment>> getComments(@PathVariable String postId, @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        String accountId = jwt != null ? jwt.getSubject() : null;
        return ResponseEntity.ok(postCommentService.getCommentsByPost(postId, accountId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        postCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/react")
    public ResponseEntity<PostComment> reactToComment(
            @PathVariable String commentId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        String emoji = request.get("emoji") != null ? String.valueOf(request.get("emoji")) : null;
        return ResponseEntity.ok(postCommentService.reactToComment(commentId, accountId, emoji));
    }
}
