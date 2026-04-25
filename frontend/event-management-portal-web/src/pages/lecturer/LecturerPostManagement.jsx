import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import PostManagement from "../../components/common/management/PostManagement";
import { toast } from "react-toastify";

const LecturerPostManagement = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [userEvents, setUserEvents] = useState([]);

  const isSystemAdmin = useMemo(() => {
    const roles = user?.roles || (user?.role ? [{ name: user.role }] : []);
    return roles.some(r => r.name === 'ADMIN' || r.name === 'SUPER_ADMIN');
  }, [user]);


  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventService.getAllPosts({ size: 1000 });
      setPosts(response.data.content || response.data || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserEvents = useCallback(async () => {
    try {
      // Use getByStatus or similar to get a broader list of events if needed, 
      // but for Lecturer, we want events where they have a role or belong to the org.
      // eventService.getMyEvents('ALL') might be better here.
      const res = await eventService.getMyEvents('ALL');
      setUserEvents(res.data || []);
    } catch (err) { }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchUserEvents();
  }, [fetchPosts, fetchUserEvents]);

  const handleCreate = async (formData) => {
    try {
      const accountId = user?.id || user?.accountId;
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
      isSystemAdmin={isSystemAdmin}
    />
  );
};

export default LecturerPostManagement;