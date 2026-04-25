import React, { useState, useEffect, useCallback } from "react";
import notificationService from "../../services/notificationService";
import NotificationManagement from "../../components/common/management/NotificationManagement";
import { toast } from "react-toastify";

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    isRefresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const response = await notificationService.getAllNotificationsForAdmin();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Lỗi fetch:", error);
      toast.error("Không thể tải danh sách thông báo");
      setNotifications([]);
    } finally {
      isRefresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) { console.error(error); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsReadAdmin();
      setNotifications(prev => prev.map((n) => ({ ...n, read: true })));
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

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return toast.warning("Vui lòng chọn thông báo để xóa");
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo?`)) {
      try {
        await notificationService.deleteBatchNotifications(selectedIds);
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
        toast.success(`Đã xóa ${selectedIds.length} thông báo`);
      } catch (error) { console.error(error); }
    }
  };

  const handleSendNotification = async (formData) => {
    const payload = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      actionUrl: formData.actionUrl || null,
      recipientIds: formData.targetUsers === "all" ? null : formData.userIds.split(",").map(id => id.trim())
    };
    await notificationService.sendNotification(payload);
    fetchNotifications(true);
    toast.success("Gửi thông báo thành công!");
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
      onBulkDelete={handleBulkDelete}
      onSendNotification={handleSendNotification}
      isAdmin={true}
    />
  );
};

export default AdminNotificationsPage;