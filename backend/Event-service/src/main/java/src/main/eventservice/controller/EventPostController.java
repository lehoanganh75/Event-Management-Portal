package src.main.eventservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.dto.PostRequestDto;
import src.main.eventservice.dto.PostResponseDto;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.service.EventPostService;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventPostController {

    private final EventPostService eventPostService;

    @GetMapping
    public ResponseEntity<Page<EventPost>> getAllPosts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) PostStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(eventPostService.getAllPosts(searchTerm, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventPost> getPostById(@PathVariable String id) {
        return ResponseEntity.ok(eventPostService.getPostById(id));
    }

    @PostMapping
    public ResponseEntity<EventPost> createPost(@RequestBody PostRequestDto postDto) {
        EventPost createdPost = eventPostService.createPost(postDto);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventPost> updatePost(
            @PathVariable String id,
            @RequestBody EventPost postDetails) {
        return ResponseEntity.ok(eventPostService.updatePost(id, postDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        eventPostService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{accountId}")
    public ResponseEntity<List<PostResponseDto>> getPostsByAccountId(
            @PathVariable String accountId) {
        List<PostResponseDto> posts = eventPostService.getPostsByAccountId(accountId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{accountId}/event/{eventId}")
    public ResponseEntity<List<PostResponseDto>> getPostsByAccountIdAndEventId(
            @PathVariable String accountId,
            @PathVariable String eventId) {
        List<PostResponseDto> posts = eventPostService.getPostsByAccountIdAndEventId(accountId, eventId);
        return ResponseEntity.ok(posts);
    }
}