package com.eventservice.controller;

import com.eventservice.dto.social.response.EventPostDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.eventservice.dto.social.request.EventPostRequest;
import com.eventservice.dto.social.response.EventPostResponse;
import com.eventservice.entity.social.EventPost;
import com.eventservice.entity.enums.PostStatus;
import com.eventservice.service.EventPostService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class EventPostController {
    private final EventPostService eventPostService;

    // Lấy tất cả bài đăng với tùy chọn tìm kiếm và lọc theo trạng thái
    @GetMapping
    public ResponseEntity<Page<EventPost>> getAllPosts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) PostStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(eventPostService.getAllPosts(searchTerm, status, pageable));
    }

    // Lấy bài đăng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<EventPostDetailResponse> getPostById(@PathVariable String id) {
        return ResponseEntity.ok(eventPostService.getPostDetail(id));
    }

    @GetMapping("/detail/{eventId}")
    public ResponseEntity<List<EventPostDetailResponse>> getEventPosts(@PathVariable String eventId) {
        List<EventPostDetailResponse> posts = eventPostService.getPostsByEvent(eventId);
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<EventPost> createPost(@RequestBody EventPostRequest postDto) {
        EventPost createdPost = eventPostService.createPost(postDto);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventPost> updatePost(
            @PathVariable String id,
            @RequestBody EventPostRequest postDto) {
        return ResponseEntity.ok(eventPostService.updatePost(id, postDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        eventPostService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{accountId}")
    public ResponseEntity<List<EventPostResponse>> getPostsByAccountId(
            @PathVariable String accountId) {
        List<EventPostResponse> posts = eventPostService.getPostsByAccountId(accountId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{accountId}/event/{eventId}")
    public ResponseEntity<List<EventPostResponse>> getPostsByAccountIdAndEventId(
            @PathVariable String accountId,
            @PathVariable String eventId) {
        List<EventPostResponse> posts = eventPostService.getPostsByAccountIdAndEventId(accountId, eventId);
        return ResponseEntity.ok(posts);
    }
    @PostMapping("/{id}/react")
    public ResponseEntity<EventPost> reactToPost(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        String emoji = request.get("emoji");
        return ResponseEntity.ok(eventPostService.reactToPost(id, accountId, emoji));
    }
}
