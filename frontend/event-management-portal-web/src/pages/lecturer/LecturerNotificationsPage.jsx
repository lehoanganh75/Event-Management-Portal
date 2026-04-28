import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";
import eventService from "../../services/eventService";
import NotificationManagement from "../../components/common/management/NotificationManagement";
import { toast } from "react-toastify";

import { useNotification } from "../../context/NotificationContext";

const LecturerNotificationsPage = () => {
  const { user } = useAuth();
  const { notifications, loading: isLoading, refreshNotifications, markAsRead, markAllAsRead } = useNotification();
  const [userEvents, setUserEvents] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = useMemo(() => user?.id || user?.accountId, [user]);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    isRefresh ? setIsRefreshing(true) : null;
    try {
      await refreshNotifications();
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, refreshNotifications]);

  const fetchUserEvents = useCallback(async () => {
    try {
      const res = await eventService.getMyEvents('ALL');
      setUserEvents(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách sự kiện:", err);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserEvents();
    }
  }, [userId, fetchUserEvents]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    await markAllAsRead();
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await notificationService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Đã xóa thông báo");
      } catch (error) { console.error(error); }
    }
  };

  const handleSendNotification = async (formData) => {
    if (!formData.eventId) return;
    try {
      // 1. Get participants
      const participantsRes = await eventService.getParticipants(formData.eventId);
      const participantIds = participantsRes.data.map(p => p.accountId);

      if (participantIds.length === 0) {
        toast.info("Sự kiện này chưa có người tham gia");
        return;
      }

      // 2. Send bulk
      const payload = {
        userIds: participantIds,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        relatedEntityId: formData.eventId,
        relatedEntityType: "EVENT",
        actionUrl: `/events/${formData.eventId}`
      };

      await notificationService.sendBulk(payload);
      toast.success(`Đã gửi thông báo đến ${participantIds.length} người tham gia!`);
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
      toast.error("Có lỗi xảy ra khi gửi thông báo");
    }
  };

  return (
    <NotificationManagement
      notifications={notifications}
      loading={isLoading}
      refreshing={isRefreshing}
      onRefresh={fetchNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      onSendNotification={handleSendNotification}
      isAdmin={false}
      userEvents={userEvents}
      title="Thông báo của tôi"
      subtitle="Cập nhật và quản lý truyền thông sự kiện"
    />
  );
};

export default LecturerNotificationsPage;