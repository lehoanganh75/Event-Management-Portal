package com.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventservice.entity.social.PostComment;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, String> {
    @Query("SELECT c FROM PostComment c WHERE c.post.id = :postId AND c.parentComment IS NULL AND c.isDeleted = false ORDER BY c.createdAt DESC")
    List<PostComment> findByPostIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(@Param("postId") String postId);
}
