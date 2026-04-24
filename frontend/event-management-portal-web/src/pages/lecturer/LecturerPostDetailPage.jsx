import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";
import authService from "../../services/authService";
import { toast } from "react-toastify";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";

const LecturerPostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getPostById(id);
      setPost(res.data);

      const userData = localStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    } catch (err) {
      toast.error("Lỗi tải chi tiết bài viết");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleLike = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }
    try {
      await eventService.toggleLikePost(id);
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi tương tác");
    }
  };

  const handleAddComment = async (content, parentId = null) => {
    try {
      await eventService.commentPost(id, {
        content,
        parentId,
        accountId: user?.accountId || user?.id
      });
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi gửi bình luận");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await eventService.deleteComment(commentId);
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  return (
    <PostDetailManagement
      post={post}
      loading={loading}
      user={user}
      onBack={() => navigate(-1)}
      onToggleLike={handleToggleLike}
      onAddComment={handleAddComment}
      onDeleteComment={handleDeleteComment}
    />
  );
};

export default LecturerPostDetailPage;
