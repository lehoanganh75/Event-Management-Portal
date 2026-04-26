import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";

const AdminPostDetailPage = () => {
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
      setPost(prev => ({ 
        ...prev, 
        ...res.data, 
        author: res.data.author || prev.author 
      }));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleReactComment = async (commentId, emoji) => {
    try {
      const res = await eventService.reactToComment(commentId, { emoji });
      setComments(prev => updateCommentInTree(prev, commentId, (old) => ({ 
        ...old, 
        ...res.data,
        author: res.data.author || old.author,
        commenter: res.data.commenter || old.commenter
      })));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleSubmitComment = async (content) => {
    setIsSubmittingComment(true);
    try {
      const res = await eventService.createComment(id, { content });
      setComments(prev => [res.data, ...prev]);
    } catch (err) {
      toast.error("Không thể gửi bình luận");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId, content) => {
    setIsSubmittingComment(true);
    try {
      const res = await eventService.createComment(id, { content, parentId });
      setComments(prev => updateCommentInTree(prev, parentId, (parent) => ({
        ...parent,
        replies: [...(parent.replies || []), res.data]
      })));
    } catch (err) {
      toast.error("Không thể gửi phản hồi");
    } finally {
      setIsSubmittingComment(false);
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
      isSubmittingComment={isSubmittingComment}
      onRefresh={loadPost}
      backPath="/admin/posts"
    />
  );
};

export default AdminPostDetailPage;