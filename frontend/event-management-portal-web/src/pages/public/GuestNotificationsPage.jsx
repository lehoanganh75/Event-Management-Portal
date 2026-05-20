import React, { useState, useEffect } from 'react';
import { Bell, Search, Clock, ChevronRight, Info, Zap, Megaphone, Loader2, Trash2, Eye, BellOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import { showToast } from '../../utils/toast.jsx';

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
  
  // Kế hoạch & Tương tác
  PLAN_CREATED: { label: "Kế hoạch đã tạo", color: "blue", icon: "📋" },
  PLAN_SUBMITTED: { label: "Kế hoạch đã gửi duyệt", color: "purple", icon: "📤" },
  PLAN_APPROVED: { label: "Kế hoạch được duyệt", color: "green", icon: "✅" },
  PLAN_REJECTED: { label: "Kế hoạch bị từ chối", color: "red", icon: "❌" },
  ACCOUNT_LOCKED: { label: "Tài khoản bị khóa", color: "red", icon: "🔒" },
  COMMENT: { label: "Bình luận", color: "blue", icon: "💬" },
  EVENT_REGISTRATION: { label: "Đăng ký sự kiện", color: "indigo", icon: "👥" },
  EVENT_FEEDBACK: { label: "Đánh giá sự kiện", color: "emerald", icon: "⭐" },
  FEEDBACK_REPLY: { label: "Phản hồi đánh giá", color: "blue", icon: "💬" },

  // Mặc định & Khác
  INVITATION: { label: "Lời mời", color: "pink", icon: "✉️" },
  GENERAL: { label: "Chung", color: "blue", icon: "📢" },
};

const getNotificationTypeInfo = (type) => {
  const upperType = type?.toUpperCase() || "";
  return NOTIFICATION_TYPES[upperType] || { label: type || "Thông báo", color: "slate", icon: "📢" };
};

const getNotificationTypeColor = (type) => {
  const info = getNotificationTypeInfo(type);
  const colorMap = {
    green: "bg-green-50 text-green-700 border-green-200/50",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200/50",
    amber: "bg-amber-50 text-amber-700 border-amber-200/50",
    orange: "bg-orange-50 text-orange-700 border-orange-200/50",
    red: "bg-red-50 text-red-700 border-red-200/50",
    blue: "bg-blue-50 text-blue-700 border-blue-200/50",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/50",
    purple: "bg-purple-50 text-purple-700 border-purple-200/50",
    pink: "bg-pink-50 text-pink-700 border-pink-200/50",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200/50",
    slate: "bg-slate-50 text-slate-700 border-slate-200/50",
  };
  return colorMap[info.color] || "bg-slate-50 text-slate-600 border-slate-200/50";
};

const NotificationCard = ({ item, language, onRead, onDelete, navigate }) => {
  const info = getNotificationTypeInfo(item.type);
  
  const handleCardClick = () => {
    if (!item.read) {
      onRead(item.id);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;

    if (diffInMs < 0) {
      return date.toLocaleDateString(language === 'VI' ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return language === 'VI' ? "Vừa xong" : "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} ${language === 'VI' ? "phút trước" : "mins ago"}`;
    if (diffInHours < 24) return `${diffInHours} ${language === 'VI' ? "giờ trước" : "hours ago"}`;
    if (diffInDays < 7) return `${diffInDays} ${language === 'VI' ? "ngày trước" : "days ago"}`;

    return date.toLocaleDateString(language === 'VI' ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      className={`bg-white rounded-xl p-5 border ${
        !item.read ? 'border-blue-200 bg-blue-50/10 shadow-sm' : 'border-slate-200/80'
      } hover:shadow transition-all group relative cursor-pointer`}
    >
      {!item.read && (
        <span className="absolute top-4 right-4 bg-blue-100 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-sm">
          MỚI
        </span>
      )}

      <div className="flex gap-4">
        <div className="flex-shrink-0 hidden sm:block">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-slate-50">
            {info.icon || "📢"}
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getNotificationTypeColor(item.type)}`}>
              {info.label}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Clock size={12} />
              {formatTime(item.createdAt)}
            </span>
          </div>

          <h3 className={`text-base line-clamp-1 mb-1 transition-colors ${!item.read ? 'font-bold text-slate-900 group-hover:text-blue-600' : 'font-medium text-slate-700'}`}>
            {item.title}
          </h3>

          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {item.message}
          </p>

          <div className="flex items-center justify-between">
            {item.actionUrl ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:underline">
                {language === 'VI' ? 'Xem chi tiết' : 'View details'}
                <ChevronRight size={14} />
              </span>
            ) : <div />}

            <div className="flex items-center gap-2">
              {!item.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead(item.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title={language === 'VI' ? 'Đánh dấu đã đọc' : 'Mark as read'}
                >
                  <Eye size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                title={language === 'VI' ? 'Xóa thông báo' : 'Delete notification'}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GuestNotificationsPage = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const userId = user?.id || user?.accountId || localStorage.getItem("userId");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/notifications' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    fetchNotifications();
  }, [isAuthenticated, userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotificationsByUser(userId);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteById(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast(language === 'VI' ? 'Đã xóa thông báo' : 'Notification deleted', 'success');
    } catch (err) {
      console.error("Error deleting notification:", err);
      showToast(language === 'VI' ? 'Không thể xóa thông báo' : 'Cannot delete notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast(language === 'VI' ? 'Đã đánh dấu tất cả là đã đọc' : 'Marked all as read', 'success');
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const filteredData = notifications.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.message?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || !item.read;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mb-4 mx-auto" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {language === 'VI' ? 'Đang xác thực...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200/60 pt-10 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Bell size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{"Thông báo"}</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {language === 'VI' ? 'Thông báo của tôi' : 'My Notifications'}
                  </h1>
                  <p className="text-slate-500 text-sm font-medium">
                    {language === 'VI' ? 'Những cập nhật mới nhất liên quan đến tài khoản của bạn' : 'Latest updates related to your account'}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200"
                  >
                    <Check size={14} />
                    <span>{language === 'VI' ? 'Đọc tất cả' : 'Read all'}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={language === 'VI' ? 'Tìm kiếm...' : 'Search...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === 'ALL'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {language === 'VI' ? 'Tất cả' : 'All'} ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('UNREAD')}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === 'UNREAD'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {language === 'VI' ? 'Chưa đọc' : 'Unread'} ({unreadCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{"Đang tải..."}</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <div className="space-y-6">
              {paginatedData.map(item => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  language={language}
                  onRead={handleRead}
                  onDelete={handleDelete}
                  navigate={navigate}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${currentPage === i + 1
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellOff size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {language === 'VI' ? 'Không tìm thấy thông báo' : 'No notifications found'}
              </h3>
              <p className="text-slate-400">
                {language === 'VI' ? 'Vui lòng quay lại sau để nhận các thông báo liên quan đến tài khoản' : 'Please check back later for account notifications'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GuestNotificationsPage;
