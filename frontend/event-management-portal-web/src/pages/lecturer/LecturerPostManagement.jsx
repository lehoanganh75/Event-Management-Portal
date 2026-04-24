import React, { useState, useEffect, useCallback } from "react";
import eventService from "../../services/eventService";
import PostManagement from "../../components/common/management/PostManagement";
import { toast } from "react-toastify";

const LecturerPostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [userEvents, setUserEvents] = useState([]);

  const getUserId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.accountId || user.account?.id || user.id || user.userId;
    }
    return null;
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const accountId = getUserId();
      let response;
      if (accountId) {
        response = await eventService.getPostsByUser(accountId);
      } else {
        response = await eventService.getAllPosts({ size: 100 });
      }
      setPosts(response.data.content || response.data || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserEvents = useCallback(async () => {
    try {
      const res = await eventService.getMyPlans(); // Assuming this returns relevant events for linking
      setUserEvents(res.data || []);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchUserEvents();
  }, [fetchPosts, fetchUserEvents]);

  const handleCreate = async (formData) => {
    try {
      const accountId = getUserId();
      await eventService.createPost({ ...formData, accountId });
      toast.success("Tạo bài viết thành công!");
      fetchPosts();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo bài viết");
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await eventService.updatePost(id, formData);
      toast.success("Cập nhật thành công!");
      fetchPosts();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await eventService.deletePost(postToDelete.id);
      toast.success("Xóa thành công!");
      fetchPosts();
      setPostToDelete(null);
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleting(false);
    }
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  return (
    <PostManagement
      posts={posts}
      loading={loading}
      user={user}
      createPost={handleCreate}
      updatePost={handleUpdate}
      deletePost={handleDelete}
      onRefresh={fetchPosts}
      eligibleEvents={userEvents}
      title="Quản lý bài đăng của tôi"
      eventTitle="Tất cả sự kiện"
      detailPathPrefix="/lecturer/posts"
    />
  );
};

export default LecturerPostManagement;