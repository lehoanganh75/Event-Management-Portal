import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import eventService from "../../services/eventService";
import PostManagement from "../../components/common/management/PostManagement";
import { toast } from "react-toastify";

const AdminPostManagement = ({ eventId, eventTitle }) => {
  const { user } = useAuth();
  const {
    posts,
    loading,
    fetchAllPosts,
    createPost,
    updatePost,
    deletePost
  } = useEvents();

  const [eligibleEvents, setEligibleEvents] = useState([]);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);

  const isSystemAdmin = useMemo(() => {
    return user?.roles?.some(r => r.name === 'ADMIN' || r.name === 'SUPER_ADMIN') || user?.role === 'ADMIN';
  }, [user]);

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
    if (user) fetchAllPosts({ size: 1000 });
  }, [user, fetchAllPosts]);

  return (
    <PostManagement
      posts={posts}
      loading={loading}
      user={user}
      createPost={createPost}
      updatePost={updatePost}
      deletePost={deletePost}
      onRefresh={() => fetchAllPosts({ size: 1000 })}
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