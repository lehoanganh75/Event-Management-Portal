package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.social.PostComment;
import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, String> {
    List<PostComment> findByPostIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(String postId);
}
