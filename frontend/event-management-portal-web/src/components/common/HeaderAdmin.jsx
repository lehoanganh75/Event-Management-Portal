import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, Check, X, CheckCircle, Calendar, Clock, AlertCircle, XCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import notificationApi from '../../api/notificationApi';

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên Cao Cấp",
  ADMIN: "Quản Trị Viên",
  ORGANIZER: "Ban Tổ Chức",
  MEMBER: "Thành Viên",
  EVENT_PARTICIPANT: "Người Tham Gia",
  GUEST: "Khách",
};

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [logoutToastVisible, setLogoutToastVisible] = useState(false);
  const notificationRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Lỗi parse user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userId = getCurrentUserId();
      if (userId) {
        fetchUnreadCount(userId);
        fetchRecentNotifications(userId);
        
        const interval = setInterval(() => {
          fetchUnreadCount(userId);
        }, 30000);
        
        return () => clearInterval(interval);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let timer;
    if (logoutToastVisible) {
      timer = setTimeout(() => setLogoutToastVisible(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [logoutToastVisible]);

  const getCurrentUserId = () => {
    if (currentUser?.id) return currentUser.id;
    if (currentUser?.accountId) return currentUser.accountId;
    if (currentUser?.account?.id) return currentUser.account.id;
    if (currentUser?.userId) return currentUser.userId;
    
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        return payload.accountId || payload.sub || payload.userId || payload.id;
      } catch (e) {
        console.error("Lỗi decode token:", e);
      }
    }
    return null;
  };

  const fetchUnreadCount = async (userId) => {
    if (!userId) return;
    try {
      const response = await notificationApi.getUnreadCount(userId);
      setUnreadCount(response.data);
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo:", error);
      setUnreadCount(0);
    }
  };

  const fetchRecentNotifications = async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await notificationApi.getRecentNotifications(userId, 5);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    setIsMarkingAll(true);
    try {
      await notificationApi.markAllAsRead(userId);
      setNotifications(
        notifications.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    const userRole = currentUser?.roles?.[0];
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      navigate("/admin/notifications");
    } else if (userRole === 'ORGANIZER') {
      navigate("/lecturer/notifications");
    } else {
      navigate("/notifications");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'EVENT_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'EVENT_REJECTED': <XCircle size={18} className="text-red-500" />,
      'REGISTRATION_CONFIRMED': <Calendar size={18} className="text-blue-500" />,
      'CHECKIN_REMINDER': <Clock size={18} className="text-orange-500" />,
      'SYSTEM': <Info size={18} className="text-purple-500" />,
      'APPROVAL': <CheckCircle size={18} className="text-emerald-500" />,
    };
    return icons[type] || <Bell size={18} className="text-slate-400" />;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getNotificationBgColor = (notification) => {
    if (!notification.read) {
      return "bg-gradient-to-r from-blue-50/80 to-transparent";
    }
    return "hover:bg-slate-50";
  };

  const getPrimaryRole = () => {
    return roleMap[currentUser?.roles?.[0]] || "Thành viên";
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsDropdownOpen(false);
    setLogoutToastVisible(true);
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/70 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate("/admin")} 
            className="cursor-pointer transition-all duration-300 hover:opacity-80"
          >
            <h1 className="text-base font-bold text-slate-800 tracking-tight uppercase">
              EMS Admin Portal
            </h1>
            <p className="text-[11px] font-medium text-slate-500 italic">
              Industrial University of Ho Chi Minh City
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 md:gap-7">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Bell size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Thông báo</h3>
                        {unreadCount > 0 && (
                          <p className="text-xs text-red-500">{unreadCount} thông báo chưa đọc</p>
                        )}
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAll}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-50"
                      >
                        {isMarkingAll ? (
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
                    {isLoading ? (
                      <div className="py-12 text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-slate-400">Đang tải...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                          className={`px-5 py-4 cursor-pointer transition-all duration-200 ${getNotificationBgColor(notification)} ${
                            !notification.read ? "border-l-4 border-l-blue-500" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`text-sm ${!notification.read ? "font-semibold text-slate-800" : "font-medium text-slate-700"}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <Clock size={10} className="text-slate-400" />
                                <p className="text-[10px] text-slate-400">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell size={28} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-1">
                          Không có thông báo
                        </p>
                        <p className="text-xs text-slate-400">
                          Bạn sẽ nhận được thông báo khi có hoạt động mới
                        </p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-5 hover:cursor-pointer py-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={handleViewAll}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 transition-colors group"
                      >
                        Xem tất cả thông báo
                        <ChevronDown size={16} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {currentUser?.fullName || currentUser?.username || "Admin IUH"}
                </p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                  {getPrimaryRole()}
                </p>
              </div>

              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-50 shadow-sm ring-1 ring-slate-200/60 transition-transform group-hover:scale-105 duration-200">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg">
                      {currentUser?.username?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>

              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                    <p className="text-sm font-bold text-slate-800">{currentUser?.fullName || currentUser?.username}</p>
                    <p className="text-[10px] text-blue-600 font-bold">{getPrimaryRole()}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      navigate("/admin/profile");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <User size={18} className="text-slate-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button 
                    onClick={() => {
                      navigate("/admin/settings");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <Settings size={18} className="text-slate-400" />
                    Cài đặt hệ thống
                  </button>
                  
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {logoutToastVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-6 right-6 z-[200]"
          >
            <div className="relative overflow-hidden w-full max-w-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-2xl shadow-2xl shadow-green-900/40 border border-white/10 backdrop-blur-xl">
              <div className="flex items-start gap-4 p-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
                    <CheckCircle size={26} className="text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg tracking-tight">Thành công</p>
                  <p className="mt-1 text-white/90 text-sm leading-relaxed">Đăng xuất thành công!</p>
                </div>
                <button 
                  onClick={() => setLogoutToastVisible(false)} 
                  className="shrink-0 p-2 rounded-full hover:bg-white/15 transition duration-200"
                >
                  <X size={20} className="text-white/80 hover:text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderAdmin;