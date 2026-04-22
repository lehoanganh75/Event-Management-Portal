import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Filter,
  MoreVertical,
  Check,
  Trash2,
  Eye,
  Clock,
  RefreshCw,
  Inbox,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  User,
  Mail,
  Send,
  X
} from "lucide-react";
import { notificationApi } from "../../api/notificationApi"; // Chú ý: dùng { notificationApi } nếu export const
import { motion, AnimatePresence } from "framer-motion";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    targetUsers: "all",
    userIds: "",
    actionUrl: ""
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  const fetchNotifications = async (isRefresh = false) => {
    isRefresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      // axiosClient tự đính kèm Token Admin
      const response = await notificationApi.get.allForAdmin();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Lỗi fetch:", error);
      setNotifications([]);
    } finally {
      isRefresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.actions.markAsRead(id);
      setNotifications(prev => 
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) { console.error(error); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.actions.markAllReadAdmin();
      setNotifications(
        notifications.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await notificationApi.delete.byId(id);
        setNotifications(notifications.filter(n => n.id !== id));
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = notifications
      .filter(n => n.selected)
      .map(n => n.id);
    
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn thông báo để xóa");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo?`)) {
      try {
        await notificationApi.delete.batch(selectedIds);
        setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
      } catch (error) {
        console.error("Error bulk deleting:", error);
      }
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    setIsSending(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        actionUrl: formData.actionUrl || null,
        // Chuyển đổi targetUsers sang format backend cần (ví dụ "ALL" hoặc danh sách ID)
        recipientIds: formData.targetUsers === "all" ? null : formData.userIds.split(",").map(id => id.trim())
      };

      await notificationApi.create.send(payload);
      
      setIsSendModalOpen(false);
      setFormData({ title: "", message: "", type: "SYSTEM", targetUsers: "all", userIds: "", actionUrl: "" });
      fetchNotifications(true);
      alert("Gửi thành công!");
    } catch (error) {
      alert("Lỗi khi gửi thông báo");
    } finally { setIsSending(false); }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;

    if (diffInMs < 60000) return "Vừa xong";
    if (diffInMs < 3600000) return `${Math.floor(diffInMs / 60000)} phút trước`;
    if (diffInMs < 86400000) return `${Math.floor(diffInMs / 3600000)} giờ trước`;
    if (diffInMs < 604800000) return `${Math.floor(diffInMs / 86400000)} ngày trước`;
    
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getNotificationTypeColor = (type) => {
    const types = {
      'EVENT_APPROVED': 'bg-green-100 text-green-700',
      'EVENT_REJECTED': 'bg-red-100 text-red-700',
      'REGISTRATION_CONFIRMED': 'bg-blue-100 text-blue-700',
      'CHECKIN_REMINDER': 'bg-orange-100 text-orange-700',
      'SYSTEM': 'bg-purple-100 text-purple-700',
      'PROMOTION': 'bg-pink-100 text-pink-700'
    };
    return types[type] || 'bg-slate-100 text-slate-600';
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'EVENT_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'EVENT_REJECTED': <XCircle size={18} className="text-red-500" />,
      'REGISTRATION_CONFIRMED': <Calendar size={18} className="text-blue-500" />,
      'CHECKIN_REMINDER': <Clock size={18} className="text-orange-500" />,
      'SYSTEM': <Info size={18} className="text-purple-500" />,
      'PROMOTION': <AlertCircle size={18} className="text-pink-500" />
    };
    return icons[type] || <Bell size={18} className="text-slate-400" />;
  };

  const formatType = (type) => {
    const typeMap = {
      'EVENT_APPROVED': 'Sự kiện được duyệt',
      'EVENT_REJECTED': 'Sự kiện bị từ chối',
      'REGISTRATION_CONFIRMED': 'Xác nhận đăng ký',
      'CHECKIN_REMINDER': 'Nhắc nhở điểm danh',
      'SYSTEM': 'Hệ thống',
    };
    return typeMap[type] || type;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "read" && notification.read) ||
                         (filterStatus === "unread" && !notification.read);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Đang tải thông báo...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Quản lý thông báo</h1>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý và gửi thông báo đến người dùng
              </p>
            </div>
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Send size={18} />
              <span>Gửi thông báo mới</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng thông báo</p>
                <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Chưa đọc</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Đã đọc</p>
                <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tỷ lệ đọc</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.length > 0 
                    ? Math.round(((notifications.length - unreadCount) / notifications.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại</option>
                <option value="SYSTEM">Hệ thống</option>
                <option value="EVENT_APPROVED">Sự kiện duyệt</option>
                <option value="EVENT_REJECTED">Sự kiện từ chối</option>
                <option value="REGISTRATION_CONFIRMED">Xác nhận đăng ký</option>
                <option value="CHECKIN_REMINDER">Nhắc nhở</option>
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications(true)}
                disabled={isRefreshing}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50"
                title="Làm mới"
              >
                <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                >
                  <Check size={16} />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>
              )}
              
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
              >
                <Trash2 size={16} />
                <span>Xóa hàng loạt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={paginatedNotifications.length > 0 && paginatedNotifications.every(n => n.selected)}
                        onChange={(e) => {
                          const currentIds = paginatedNotifications.map(n => n.id);
                          setNotifications(notifications.map(n => 
                            currentIds.includes(n.id) ? { ...n, selected: e.target.checked } : n
                          ));
                        }}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Thông báo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`hover:bg-slate-50 transition-colors ${!notification.read ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={notification.selected || false}
                          onChange={(e) => {
                            setNotifications(notifications.map(n => 
                              n.id === notification.id 
                                ? { ...n, selected: e.target.checked }
                                : n
                            ));
                          }}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {!notification.read ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-600">Chưa đọc</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Check size={14} className="text-green-500" />
                            <span className="text-xs text-slate-500">Đã đọc</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <p className={`text-sm ${!notification.read ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.actionUrl && (
                              <button
                                onClick={() => navigate(notification.actionUrl)}
                                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700"
                              >
                                Xem chi tiết
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                          {formatType(notification.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === notification.id ? null : notification.id);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {openDropdownId === notification.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-1">
                              {!notification.read && (
                                <button
                                  onClick={() => {
                                    handleMarkAsRead(notification.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Eye size={14} />
                                  Đánh dấu đã đọc
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleDelete(notification.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Xóa thông báo
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="p-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox size={48} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium mb-2">
                Không có thông báo nào
              </p>
              <p className="text-sm text-slate-400">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Không tìm thấy thông báo phù hợp"
                  : "Hãy gửi thông báo đầu tiên"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      <AnimatePresence>
        {isSendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSendModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Send size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Gửi thông báo mới</h2>
                    <p className="text-sm text-slate-500">Gửi thông báo đến người dùng</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề thông báo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung thông báo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loại thông báo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SYSTEM">Hệ thống</option>
                    <option value="EVENT_APPROVED">Sự kiện được duyệt</option>
                    <option value="EVENT_REJECTED">Sự kiện bị từ chối</option>
                    <option value="REGISTRATION_CONFIRMED">Xác nhận đăng ký</option>
                    <option value="CHECKIN_REMINDER">Nhắc nhở điểm danh</option>
                    <option value="PROMOTION">Khuyến mãi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Đối tượng nhận
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="all"
                        checked={formData.targetUsers === "all"}
                        onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                        className="text-blue-500"
                      />
                      <span className="text-sm">Tất cả người dùng</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="specific"
                        checked={formData.targetUsers === "specific"}
                        onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                        className="text-blue-500"
                      />
                      <span className="text-sm">Chọn người dùng cụ thể</span>
                    </label>
                    
                    {formData.targetUsers === "specific" && (
                      <div>
                        <textarea
                          value={formData.userIds}
                          onChange={(e) => setFormData({ ...formData, userIds: e.target.value })}
                          placeholder="Nhập ID người dùng, cách nhau bằng dấu phẩy (,)&#10;Ví dụ: user1, user2, user3"
                          rows={3}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          * Nhập ID người dùng, mỗi ID cách nhau bằng dấu phẩy
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    URL hành động (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: /events/123"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSendModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Gửi thông báo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNotifications;