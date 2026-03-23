import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Check,
  MoreVertical,
  Loader2,
  Bell,
  BellOff,
  Trash2,
  RefreshCw,
  Inbox,
  ChevronRight,
  Eye,
} from "lucide-react";
import notificationApi from "../../api/notificationApi";
import Header from "../../components/common/Header";

// Định nghĩa constants bên ngoài component để tái sử dụng
const NOTIFICATION_TYPES = {
  // Người dùng
  REGISTRATION_CONFIRMED: { label: "Xác nhận đăng ký", color: "green", icon: "✅" },
  CHECKIN_REMINDER: { label: "Nhắc nhở điểm danh", color: "yellow", icon: "⏰" },
  CHECKIN_SUCCESS: { label: "Điểm danh thành công", color: "emerald", icon: "📝" },
  EVENT_STARTING_SOON: { label: "Sự kiện sắp diễn ra", color: "blue", icon: "🎉" },
  EVENT_CANCELLED: { label: "Sự kiện bị hủy", color: "red", icon: "❌" },
  EVENT_RESCHEDULED: { label: "Sự kiện thay đổi lịch", color: "orange", icon: "📅" },
  PARTICIPATION_APPROVED: { label: "Được duyệt tham gia", color: "green", icon: "✅" },
  PARTICIPATION_REJECTED: { label: "Bị từ chối tham gia", color: "red", icon: "❌" },
  
  // Admin/BTC
  EVENT_SUBMITTED: { label: "Gửi phê duyệt sự kiện", color: "purple", icon: "📝" },
  NEW_REGISTRATION: { label: "Đăng ký mới", color: "indigo", icon: "👥" },
  CHECKIN_NOTIFICATION: { label: "Thông báo điểm danh", color: "cyan", icon: "📌" },
  EVENT_FULL: { label: "Sự kiện đã đủ số lượng", color: "orange", icon: "⚠️" },
  APPROVAL_REMINDER: { label: "Nhắc nhở phê duyệt", color: "amber", icon: "⏰" },
  
  // Superadmin
  EVENT_APPROVED: { label: "Phê duyệt sự kiện", color: "green", icon: "✅" },
  EVENT_REJECTED: { label: "Từ chối sự kiện", color: "red", icon: "❌" },
  USER_REPORT: { label: "Báo cáo vi phạm", color: "red", icon: "🚨" },
  ESCALATION_REQUEST: { label: "Yêu cầu can thiệp", color: "orange", icon: "⚠️" },
  
  // Hệ thống
  SYSTEM: { label: "Hệ thống", color: "slate", icon: "⚙️" },
  MAINTENANCE: { label: "Bảo trì hệ thống", color: "slate", icon: "🔧" },
  POLICY_UPDATE: { label: "Cập nhật chính sách", color: "blue", icon: "📜" },
  
  // Mặc định
  ORDER: { label: "Đơn hàng", color: "orange", icon: "🛒" },
  PAYMENT: { label: "Thanh toán", color: "green", icon: "💳" },
  MESSAGE: { label: "Tin nhắn", color: "blue", icon: "💬" },
  PROMOTION: { label: "Khuyến mãi", color: "pink", icon: "🎁" },
  REMINDER: { label: "Nhắc nhở", color: "yellow", icon: "⏰" },
};

const NotificationPage = () => {
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const getCurrentUserId = () => {
    if (urlUserId) return urlUserId;

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

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        accountId = user.id || user.accountId || user.userId || user.sub;
        if (accountId) {
          localStorage.setItem("userId", accountId);
          return accountId;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    return null;
  };

  const currentUserId = getCurrentUserId();

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId]);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    notificationApi
      .getNotificationsByUser(currentUserId)
      .then((res) => {
        console.log("📦 Notifications received:", res.data);
        // Debug: Kiểm tra type của từng notification
        if (res.data && res.data.length > 0) {
          res.data.forEach(n => {
            console.log(`- Type: ${n.type}, Title: ${n.title}`);
          });
        }
        setNotifications(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      })
      .finally(() => {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      });
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(currentUserId);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;

    if (diffInMs < 0) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return n.read === false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationTypeInfo = (type) => {
    const upperType = type?.toUpperCase() || "";
    const info = NOTIFICATION_TYPES[upperType];
    if (info) return info;
    
    console.warn(`Unknown notification type: ${type}`);
    return { label: type || "Thông báo", color: "slate", icon: "📢" };
  };

  const getNotificationTypeColor = (type) => {
    const info = getNotificationTypeInfo(type);
    const colorMap = {
      green: "bg-green-100 text-green-700",
      emerald: "bg-emerald-100 text-emerald-700",
      yellow: "bg-yellow-100 text-yellow-700",
      amber: "bg-amber-100 text-amber-700",
      orange: "bg-orange-100 text-orange-700",
      red: "bg-red-100 text-red-700",
      blue: "bg-blue-100 text-blue-700",
      indigo: "bg-indigo-100 text-indigo-700",
      purple: "bg-purple-100 text-purple-700",
      pink: "bg-pink-100 text-pink-700",
      cyan: "bg-cyan-100 text-cyan-700",
      slate: "bg-slate-100 text-slate-700",
    };
    return colorMap[info.color] || "bg-slate-100 text-slate-600";
  };

  const formatType = (type) => {
    const info = getNotificationTypeInfo(type);
    return info.icon ? `${info.icon} ${info.label}` : info.label;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Đang tải thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Cập nhật những hoạt động mới nhất
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                title="Làm mới"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200"
                >
                  <Check size={16} />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === "all"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Inbox size={18} />
                <span>Tất cả</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === "all"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {notifications.length}
                </span>
              </div>
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === "unread"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye size={18} />
                <span>Chưa đọc</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === "unread"
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {unreadCount}
                </span>
              </div>
              {activeTab === "unread" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative transition-all duration-200 ${
                    notification.actionUrl ? "cursor-pointer" : ""
                  } ${!notification.read ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50"}`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-1">
                        {!notification.read ? (
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md animate-pulse" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-200 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3
                                className={`text-base ${!notification.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}
                              >
                                {notification.title}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}
                              >
                                {formatType(notification.type)}
                              </span>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock size={12} />
                                {formatTime(notification.createdAt)}
                              </span>

                              {notification.actionUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  Xem chi tiết
                                  <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(
                                    openDropdownId === notification.id
                                      ? null
                                      : notification.id,
                                  );
                                }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  openDropdownId === notification.id
                                    ? "bg-slate-200 text-slate-800"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                                }`}
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openDropdownId === notification.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!notification.read) {
                                        handleMarkAsRead(notification.id);
                                      }
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                    disabled={notification.read}
                                  >
                                    <Eye size={14} />
                                    Đánh dấu đã đọc
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(notification.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellOff size={48} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium mb-2">
                {activeTab === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Không có thông báo nào"}
              </p>
              <p className="text-sm text-slate-400">
                {activeTab === "unread"
                  ? "Tất cả thông báo đã được đọc"
                  : "Hãy quay lại sau để xem thông báo mới"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;