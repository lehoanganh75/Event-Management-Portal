package src.main.eventservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import src.main.eventservice.entity.EventPost;
import src.main.eventservice.entity.enums.PostStatus;

public interface EventPostService {
    // 1. Tìm kiếm và Lọc (Search & Filter)
    Page<EventPost> getAllPosts(String title, PostStatus status, Pageable pageable);

    // 2. Lấy chi tiết theo ID
    EventPost getPostById(String id);

    // 3. Thêm mới bài viết
    @Transactional
    EventPost createPost(EventPost post);

    // 4. Cập nhật bài viết
    @Transactional
    EventPost updatePost(String id, EventPost postDetails);

    // 5. Xóa bài viết (Soft Delete)
    @Transactional
    void deletePost(String id);
}
