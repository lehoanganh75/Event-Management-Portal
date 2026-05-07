import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import PostManagement from "../../components/common/management/PostManagement";
import { toast } from "react-toastify";

const AdminPostManagement = ({ eventId, eventTitle }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibleEvents, setEligibleEvents] = useState([]);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);

  const isSystemAdmin = useMemo(() => {
    return ['ADMIN', 'SUPER_ADMIN'].includes(user?.role?.toUpperCase());
  }, [user]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // Backend đã tự xử lý: Admin thấy hết, Lecturer thấy phần liên quan
      const res = await eventService.getMyInvolvedPosts();
      setPosts(res || []);
    } catch (err) {
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEligibleEvents = async () => {
    setIsFetchingEvents(true);
    try {
      const res = await eventService.getByStatus("PUBLISHED,ONGOING,COMPLETED");
      setEligibleEvents(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setIsFetchingEvents(false);
    }
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handleCreate = async (formData) => {
    try {
      const accountId = user?.id || user?.accountId;
      await eventService.createPost({ ...formData, accountId });
      toast.success("Tạo bài viết thành công!");
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo bài viết");
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await eventService.updatePost(id, formData);
      toast.success("Cập nhật thành công!");
      fetchPosts();
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const handleDelete = async (postId) => {
    try {
      await eventService.deletePost(postId);
      toast.success("Xóa thành công!");
      fetchPosts();
    } catch (error) {
      toast.error("Lỗi khi xóa");
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
      title="Quản lý bài đăng (Admin)"
      eventTitle={eventTitle}
      eligibleEvents={eligibleEvents}
      isFetchingEvents={isFetchingEvents}
      fetchEligibleEvents={fetchEligibleEvents}
      isSystemAdmin={isSystemAdmin}
      detailPathPrefix="/admin/posts"
    />
  );
};

export default AdminPostManagement;