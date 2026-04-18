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
  Mail,
  FileText,
  Send,
  Users,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Hàm decode JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Hàm lấy userId hiện tại
const getCurrentUserId = () => {
  let accountId = localStorage.getItem("userId");
  if (accountId) return accountId;

  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    try {
      const decoded = decodeJWT(accessToken);
      if (decoded?.accountId) {
        localStorage.setItem("userId", decoded.accountId);
        return decoded.accountId;
      }
      if (decoded?.sub || decoded?.id) {
        const id = decoded.sub || decoded.id;
        localStorage.setItem("userId", id);
        return id;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  
  // Fallback: lấy từ user object
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      const userId = user.id || user.accountId || user.userId;
      if (userId) {
        localStorage.setItem("userId", userId);
        return userId;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  return null;
};

const LecturerNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const ITEMS_PER_PAGE = 6;

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Lấy userId khi component mount
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      setUserId(currentUserId);
      console.log("Current user ID:", currentUserId);
    } else {
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

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
    if (!userId) {
      setError("Không tìm thấy ID người dùng");
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log("Fetching notifications for user:", userId);
      const response = await notificationApi.getNotificationsByUser(userId);
      console.log("Notifications response:", response);
      
      // Xử lý response với nhiều format khác nhau
      let notificationsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          notificationsData = response.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          notificationsData = response.data.content;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          notificationsData = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          notificationsData = response.data.items;
        }
      }
      
      // Đảm bảo mỗi notification có trường read (nếu không có thì mặc định là false)
      const formattedNotifications = notificationsData.map(notif => ({
        ...notif,
        read: notif.read === true || notif.read === 1 || notif.status === "READ",
        type: notif.type || notif.notificationType || "SYSTEM"
      }));
      
      setNotifications(formattedNotifications);
      
      if (formattedNotifications.length === 0) {
        console.log("No notifications found");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.response?.data?.message || error.message || "Không thể tải thông báo");
      setNotifications([]);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await notificationApi.markAllAsRead(userId);
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
        await notificationApi.deleteNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Không thể xóa thông báo");
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Không xác định";
    
    try {
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
    } catch {
      return "Không xác định";
    }
  };

  const getNotificationTypeColor = (type) => {
    const types = {
      'PLAN_CREATED': 'bg-emerald-100 text-emerald-700',
      'PLAN_SUBMITTED': 'bg-blue-100 text-blue-700',
      'PLAN_APPROVED': 'bg-green-100 text-green-700',
      'PLAN_REJECTED': 'bg-red-100 text-red-700',
      'EVENT_CREATED': 'bg-purple-100 text-purple-700',
      'EVENT_APPROVED': 'bg-green-100 text-green-700',
      'EVENT_REJECTED': 'bg-red-100 text-red-700',
      'EVENT_UPDATED': 'bg-amber-100 text-amber-700',
      'EVENT_CANCELLED': 'bg-orange-100 text-orange-700',
      'REGISTRATION_CONFIRMED': 'bg-blue-100 text-blue-700',
      'CHECKIN_SUCCESS': 'bg-emerald-100 text-emerald-700',
      'CHECKIN_REMINDER': 'bg-orange-100 text-orange-700',
      'SYSTEM': 'bg-slate-100 text-slate-600'
    };
    return types[type] || 'bg-slate-100 text-slate-600';
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'PLAN_CREATED': <FileText size={18} className="text-emerald-500" />,
      'PLAN_SUBMITTED': <Send size={18} className="text-blue-500" />,
      'PLAN_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'PLAN_REJECTED': <XCircle size={18} className="text-red-500" />,
      'EVENT_CREATED': <Calendar size={18} className="text-purple-500" />,
      'EVENT_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'EVENT_REJECTED': <XCircle size={18} className="text-red-500" />,
      'EVENT_UPDATED': <Info size={18} className="text-amber-500" />,
      'EVENT_CANCELLED': <AlertCircle size={18} className="text-orange-500" />,
      'REGISTRATION_CONFIRMED': <Users size={18} className="text-blue-500" />,
      'CHECKIN_SUCCESS': <CheckCircle size={18} className="text-emerald-500" />,
      'CHECKIN_REMINDER': <Clock size={18} className="text-orange-500" />,
      'SYSTEM': <Info size={18} className="text-slate-500" />
    };
    return icons[type] || <Bell size={18} className="text-slate-400" />;
  };

  const formatType = (type) => {
    const typeMap = {
      'PLAN_CREATED': 'Kế hoạch đã tạo',
      'PLAN_SUBMITTED': 'Đã gửi phê duyệt',
      'PLAN_APPROVED': 'Kế hoạch được duyệt',
      'PLAN_REJECTED': 'Kế hoạch bị từ chối',
      'EVENT_CREATED': 'Sự kiện đã tạo',
      'EVENT_APPROVED': 'Sự kiện được duyệt',
      'EVENT_REJECTED': 'Sự kiện bị từ chối',
      'EVENT_UPDATED': 'Sự kiện cập nhật',
      'EVENT_CANCELLED': 'Sự kiện bị hủy',
      'REGISTRATION_CONFIRMED': 'Xác nhận đăng ký',
      'CHECKIN_SUCCESS': 'Điểm danh thành công',
      'CHECKIN_REMINDER': 'Nhắc nhở điểm danh',
      'SYSTEM': 'Hệ thống'
    };
    return typeMap[type] || type;
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Điều hướng dựa trên loại thông báo và dữ liệu kèm theo
    const data = notification.data || notification.metadata || {};
    
    if (data.planId) {
      navigate(`/lecturer/plans/${data.planId}`);
    } else if (data.eventId) {
      navigate(`/lecturer/events/${data.eventId}`);
    } else if (data.postId) {
      navigate(`/lecturer/posts/${data.postId}`);
    } else if (notification.type?.includes('QUESTION')) {
      navigate(`/lecturer/events/questions`);
    } else if (notification.type?.includes('POLL')) {
      navigate(`/lecturer/events/polls`);
    }
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

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Không thể tải thông báo</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => {
              const newUserId = getCurrentUserId();
              if (newUserId) {
                setUserId(newUserId);
                fetchNotifications();
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Thông báo của tôi</h1>
            <p className="text-sm text-slate-500 mt-1">
              Cập nhật về kế hoạch, sự kiện và các hoạt động của bạn
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              <span>Làm mới</span>
            </button>
          </div>
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
              <option value="PLAN_CREATED">Kế hoạch đã tạo</option>
              <option value="PLAN_SUBMITTED">Đã gửi phê duyệt</option>
              <option value="PLAN_APPROVED">Kế hoạch được duyệt</option>
              <option value="PLAN_REJECTED">Kế hoạch bị từ chối</option>
              <option value="EVENT_CREATED">Sự kiện đã tạo</option>
              <option value="EVENT_APPROVED">Sự kiện được duyệt</option>
              <option value="EVENT_REJECTED">Sự kiện bị từ chối</option>
              <option value="REGISTRATION_CONFIRMED">Xác nhận đăng ký</option>
              <option value="CHECKIN_REMINDER">Nhắc nhở điểm danh</option>
              <option value="SYSTEM">Hệ thống</option>
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
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
            >
              <Check size={16} />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <>
            <div className="divide-y divide-slate-100">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-slate-50 transition-all cursor-pointer ${
                    !notification.read ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        !notification.read ? "bg-white shadow-sm" : "bg-slate-100"
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`text-sm ${!notification.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                              {notification.title || "Thông báo mới"}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                              {formatType(notification.type)}
                            </span>
                            {!notification.read && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                Mới
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {notification.message || notification.content || "Không có nội dung"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{formatTime(notification.createdAt || notification.createdDate)}</span>
                            </div>
                            {notification.read && (
                              <div className="flex items-center gap-1">
                                <Check size={12} />
                                <span>Đã đọc</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Đánh dấu đã đọc"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === notification.id ? null : notification.id);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openDropdownId === notification.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-1">
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                            : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
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
                : "Bạn sẽ nhận được thông báo khi có cập nhật về kế hoạch và sự kiện"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerNotifications;