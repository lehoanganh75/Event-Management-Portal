import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Quản trị hệ thống",
  EVENT_MANAGER: "Quản lý sự kiện",
  LECTURER: "Giảng viên",
  ORGANIZER: "Ban Tổ Chức",
  STUDENT: "Sinh viên",
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
  const notificationRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      fetchRecentNotifications();
      
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.id || currentUser.accountId || currentUser.account?.id || currentUser.userId;
      if (userId) {
        const response = await notificationApi.getUnreadCount(userId);
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo:", error);
    }
  };

  const fetchRecentNotifications = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const userId = currentUser.id || currentUser.accountId || currentUser.account?.id || currentUser.userId;
      if (userId) {
        const response = await notificationApi.getRecentNotifications(userId, 5);
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
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
    try {
      const userId = currentUser.id || currentUser.accountId || currentUser.account?.id || currentUser.userId;
      if (userId) {
        await notificationApi.markAllAsRead(userId);
        setNotifications(
          notifications.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
    }
  };

 const handleViewAll = () => {
  setIsNotificationOpen(false);
  const userRole = currentUser?.roles?.[0];
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    navigate("/admin/notifications");
  } else if (userRole === 'ORGANIZER' || userRole === 'LECTURER') {
    navigate("/lecturer/notifications");
  } else {
    navigate("/notifications");
  }
};

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EVENT_APPROVED':
        return '✅';
      case 'EVENT_REJECTED':
        return '❌';
      case 'REGISTRATION_CONFIRMED':
        return '📝';
      case 'CHECKIN_REMINDER':
        return '⏰';
      default:
        return '🔔';
    }
  };

  return (
    <header 
      className="
        h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/70 
        flex items-center justify-between px-6 md:px-8 
        sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.04)]
        transition-all duration-200
      "
    >
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-800 tracking-tight uppercase">
            EMS Admin Portal
          </h1>
          <p className="text-[11px] font-medium text-slate-500 italic">
            Industrial University of Ho Chi Minh City
          </p>
        </div>
        <div className="sm:hidden text-sm font-bold text-blue-700">
          EMS ADMIN
        </div>
      </div>

      <div className="flex items-center gap-5 md:gap-7">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="
              relative p-2.5 text-slate-500 hover:text-blue-600 
              hover:bg-blue-50 rounded-xl transition-all duration-200
            "
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <h3 className="font-bold text-slate-800 text-sm">
                  Thông báo
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs font-normal text-red-500">
                      ({unreadCount} chưa đọc)
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Check size={12} /> Đánh dấu đã đọc
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="py-8 text-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-slate-400">Đang tải...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${
                        !notification.read ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!notification.read ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400">Không có thông báo nào</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 transition-colors"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {currentUser?.username || "Admin IUH"}
              </p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                {roleMap[currentUser?.roles?.[0]] || "Quản trị viên"}
              </p>
            </div>

            <div className="relative">
              <div 
                className="
                  w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-50 
                  shadow-sm ring-1 ring-slate-200/60 transition-transform 
                  group-hover:scale-105 duration-200
                "
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>

            <ChevronDown 
              size={16} 
              className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                  <p className="text-sm font-bold text-slate-800">{currentUser?.username}</p>
                  <p className="text-[10px] text-blue-600 font-bold">{roleMap[currentUser?.roles?.[0]]}</p>
                </div>
                
                <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <User size={18} className="text-slate-400" />
                  Hồ sơ cá nhân
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
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
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;