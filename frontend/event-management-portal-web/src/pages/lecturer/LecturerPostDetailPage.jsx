import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";

const LecturerPostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { user: currentUser } = useAuth();

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getPostById(id);
      setPost(res.data);
      const commentRes = await eventService.getComments(id);
      setComments(commentRes.data || []);
    } catch (err) {
      setError("Không thể tải thông tin bài viết");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadPost();
  }, [id, loadPost]);

  const updateCommentInTree = (list, commentId, updateFn) => {
    return list.map(item => {
      if (item.id === commentId) return updateFn(item);
      if (item.replies?.length > 0) return { ...item, replies: updateCommentInTree(item.replies, commentId, updateFn) };
      return item;
    });
  };

  const handleReactPost = async (emoji) => {
    try {
      const res = await eventService.reactToPost(id, { emoji });
      setPost(res.data);
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleReactComment = async (commentId, emoji) => {
    try {
      const res = await eventService.reactToComment(commentId, { emoji });
      setComments(prev => updateCommentInTree(prev, commentId, () => res.data));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleSubmitComment = async (content, imageUrl) => {
    if (isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await eventService.createComment(id, { content, imageUrl });
      const newComment = res.data;
      setComments(prev => {
        if (prev.some(c => String(c.id) === String(newComment.id))) return prev;
        return [newComment, ...prev];
      });
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) {
      toast.error("Không thể gửi bình luận");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId, content, imageUrl) => {
    if (isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await eventService.createComment(id, { content, parentId, imageUrl });
      const newReply = res.data;
      setComments(prev => updateCommentInTree(prev, parentId, (parent) => {
        const existingReplies = parent.replies || [];
        if (existingReplies.some(r => String(r.id) === String(newReply.id))) return parent;
        return {
          ...parent,
          replies: [...existingReplies, newReply]
        };
      }));
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) {
      toast.error("Không thể gửi phản hồi");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    // Optimistic Update
    const previousComments = [...comments];
    const previousPost = { ...post };

    setComments(prev => {
      const removeById = (list, id) => {
        return list
          .filter(item => String(item.id) !== String(id))
          .map(item => ({
            ...item,
            replies: item.replies ? removeById(item.replies, id) : []
          }));
      };
      return removeById(prev, commentId);
    });
    setPost(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));

    try {
      await eventService.deleteComment(commentId);
      toast.success("Đã xóa bình luận");
    } catch (err) {
      // Rollback
      setComments(previousComments);
      setPost(previousPost);
      toast.error("Không thể xóa bình luận. Vui lòng thử lại.");
    }
  };

  return (
    <PostDetailManagement
      post={post}
      comments={comments}
      currentUser={currentUser}
      loading={loading}
      error={error}
      handleReactPost={handleReactPost}
      handleReactComment={handleReactComment}
      handleSubmitComment={handleSubmitComment}
      handleSubmitReply={handleSubmitReply}
      handleDeleteComment={handleDeleteComment}
      isSubmittingComment={isSubmittingComment}
      onRefresh={loadPost}
      backPath="/lecturer/posts"
    />
  );
};

export default LecturerPostDetailPage;
