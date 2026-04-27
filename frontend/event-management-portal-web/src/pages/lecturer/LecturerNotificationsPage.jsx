import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";
import eventService from "../../services/eventService";
import NotificationManagement from "../../components/common/management/NotificationManagement";
import { toast } from "react-toastify";

const LecturerNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = useMemo(() => user?.id || user?.accountId, [user]);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    isRefresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const response = await notificationService.getNotificationsByUser(userId);
      let data = [];
      if (Array.isArray(response.data)) data = response.data;
      else if (response.data?.content) data = response.data.content;
      else if (response.data?.data) data = response.data.data;

      setNotifications(data.map(n => ({
        ...n,
        read: n.read === true || n.status === "READ"
      })));
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      isRefresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, [userId]);

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
      fetchNotifications();
      fetchUserEvents();
    }
  }, [userId, fetchNotifications, fetchUserEvents]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) { console.error(error); }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) { console.error(error); }
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