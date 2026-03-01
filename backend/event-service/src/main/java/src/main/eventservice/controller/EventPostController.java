package src.main.eventservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;
import src.main.eventservice.service.EventPostService;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
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
    public ResponseEntity<EventPost> createPost(@RequestBody EventPost post) {
        EventPost createdPost = eventPostService.createPost(post);
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
}