import React, { useState, useEffect, useCallback } from "react";
import notificationService from "../../services/notificationService";
import NotificationManagement from "../../components/common/management/NotificationManagement";
import ConfirmModal from "../../components/common/ConfirmModal";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const AdminNotificationsPage = () => {
  const { notifications, loading: isLoading, refreshNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: null });

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    isRefresh ? setIsRefreshing(true) : null;
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshNotifications]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await deleteNotification(id);
          toast.success("Đã xóa thông báo");
        } catch (error) { console.error(error); }
      }
    });
  };

  const handleBulkDelete = (selectedIds) => {
    if (selectedIds.length === 0) return toast.warning("Vui lòng chọn thông báo để xóa");
    setConfirmModal({
      isOpen: true,
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo đã chọn?`,
      onConfirm: async () => {
        try {
          await notificationService.deleteBatchNotifications(selectedIds);
          // refreshNotifications will be called automatically or we can manually refresh
          await refreshNotifications();
          toast.success(`Đã xóa ${selectedIds.length} thông báo`);
        } catch (error) { console.error(error); }
      }
    });
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
    <>
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
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title="Xác nhận xóa"
        confirmText="Xóa ngay"
        type="danger"
      />
    </>
  );
};

export default AdminNotificationsPage;
