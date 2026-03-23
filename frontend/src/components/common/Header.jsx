import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  User,
  LogOut,
  Mail,
  Globe,
  Settings,
  ShieldCheck,
  ChevronDown,
  Bell,
  Check,
  X,
  Clock,
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import notificationApi from "../../api/notificationApi";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên Cao Cấp",
  ADMIN: "Quản Trị Viên",
  ORGANIZER: "Ban Tổ Chức",
  MEMBER: "Thành Viên",
  EVENT_PARTICIPANT: "Người Tham Gia Sự Kiện",
  GUEST: "Khách",
};

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8082/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [logoutToastVisible, setLogoutToastVisible] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef(null);
  const lastClickedRef = useRef(null);
  const lockActiveRef = useRef(false);
  const lockTimerRef = useRef(null);

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
  };
  
  useEffect(() => {
    if (currentUser) {
      const userId = getCurrentUserId();
      if (userId) {
        fetchUnreadCount(userId);
        fetchRecentNotifications(userId);
        const interval = setInterval(() => fetchUnreadCount(userId), 30000);
        return () => clearInterval(interval);
      }
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

  useEffect(() => {
    let timer;
    if (logoutToastVisible) {
      timer = setTimeout(() => setLogoutToastVisible(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [logoutToastVisible]);

  const fetchUnreadCount = async (userId) => {
    if (!userId) return;
    try {
      const response = await notificationApi.getUnreadCount(userId);
      setUnreadCount(response.data);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  const fetchRecentNotifications = async (userId) => {
    if (!userId) return;
    try {
      const response = await notificationApi.getRecentNotifications(userId, 5);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
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
      console.error("Error marking as read:", error);
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
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    const userRole = currentUser?.roles?.[0];
    const userId = getCurrentUserId();
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      navigate("/admin/notifications");
    } else if (userRole === 'ORGANIZER') {
      navigate("/lecturer/notifications");
    } else {
      navigate(`/notifications/${userId || ''}`);
    }
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

  const getNotificationIcon = (type) => {
    const icons = {
      'EVENT_APPROVED': <CheckCircle size={20} className="text-green-500" />,
      'EVENT_REJECTED': <XCircle size={20} className="text-red-500" />,
      'REGISTRATION_CONFIRMED': <Calendar size={20} className="text-blue-500" />,
      'CHECKIN_REMINDER': <Clock size={20} className="text-orange-500" />,
      'SYSTEM': <Info size={20} className="text-purple-500" />,
      'PROMOTION': <AlertCircle size={20} className="text-pink-500" />,
    };
    return icons[type] || <Bell size={20} className="text-slate-400" />;
  };

  const getNotificationBgColor = (notification) => {
    if (!notification.read) {
      return "bg-gradient-to-r from-blue-50/80 to-transparent";
    }
    return "hover:bg-slate-50";
  };

  const checkActiveSection = useCallback(() => {
    if (lockActiveRef.current) return;
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }
    if (isScrollingRef.current) return;
    const sections = ["gioi-thieu", "su-kien"];
    let foundSection = null;
    let maxVisiblePercent = 0;
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visiblePercent = (visibleHeight / rect.height) * 100;
        if (visiblePercent > maxVisiblePercent) {
          maxVisiblePercent = visiblePercent;
          foundSection = section;
        }
      }
    }
    if (foundSection && maxVisiblePercent > 20) {
      setActiveSection(foundSection);
    } else {
      setActiveSection(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const handleScroll = () => {
      if (timeoutRef.current) {
        cancelAnimationFrame(timeoutRef.current);
      }
      timeoutRef.current = requestAnimationFrame(checkActiveSection);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(checkActiveSection, 100);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        cancelAnimationFrame(timeoutRef.current);
      }
    };
  }, [location.pathname, checkActiveSection]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEventFeedReady = () => {
      setTimeout(checkActiveSection, 100);
    };
    window.addEventListener("eventFeedReady", handleEventFeedReady);
    return () => {
      window.removeEventListener("eventFeedReady", handleEventFeedReady);
    };
  }, [checkActiveSection]);

  const isLecturerPage = location.pathname.startsWith("/lecturer");
  const isLoginPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  const getPrimaryRole = () => {
    return roleMap[currentUser?.roles?.[0]] || "Thành viên";
  };

  const hasLecturerAccess = () => {
    return currentUser?.roles?.some((r) =>
      ["ADMIN", "LECTURER", "SUPER_ADMIN", "ORGANIZER"].includes(r),
    );
  };

  const getManagementPath = () => {
    if (!currentUser?.roles) return null;
    if (currentUser.roles.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r)))
      return "/admin";
    if (currentUser.roles.includes("ORGANIZER")) return "/lecturer";
    return null;
  };

  const getManagementButtonText = () => {
    if (!currentUser?.roles) return "";
    if (currentUser.roles.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r)))
      return "Quản trị";
    return "Bảng điều khiển";
  };

  const getNavClass = (section) => {
    const base =
      "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:cursor-pointer";
    return `${base} ${
      activeSection === section
        ? "text-blue-600 bg-blue-50"
        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
    }`;
  };

  const getAttendanceClass = () => {
    const base =
      "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200";
    return `${base} ${
      location.pathname === "/attendance"
        ? "text-orange-600 bg-orange-50"
        : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
    }`;
  };

  const getManagementButtonClass = () => {
    const base =
      "ml-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border";
    return `${base} bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100`;
  };

  const handleMenuItemClick = (itemId) => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
    }
    lastClickedRef.current = itemId;
    lockActiveRef.current = true;
    isScrollingRef.current = true;
    setActiveSection(itemId);
    const scrollToSection = () => {
      const el = document.getElementById(itemId);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      } else {
        isScrollingRef.current = false;
      }
    };
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToSection, 300);
    } else {
      scrollToSection();
    }
    lockTimerRef.current = setTimeout(() => {
      lockActiveRef.current = false;
      checkActiveSection();
    }, 1500);
  };

  const handleLogout = async () => {
    try {
      const API_LOGOUT = `${import.meta.env.VITE_AUTH_API_URL}/auth/logout`;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axios.post(API_LOGOUT, null, {
          params: { refreshToken },
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.clear();
      setCurrentUser(null);
      setIsMenuOpen(false);
      setIsLogoutModalOpen(false);
      setLogoutToastVisible(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  if (loading) {
    return (
      <header className="w-full font-sans sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="bg-gradient-to-r from-[#1a479a] to-[#2563eb] text-white py-1.5 px-4 md:px-10">
          <div className="flex justify-between items-center">
            <div>Hệ thống Quản lý Sự kiện IUH</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="w-full font-sans sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="bg-gradient-to-r from-[#1a479a] to-[#2563eb] text-white py-1.5 px-4 md:px-10 flex justify-between items-center text-[11px] font-medium tracking-wide">
          <div className="hidden md:flex items-center gap-2 opacity-90">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Hệ thống Quản lý Sự kiện IUH
          </div>
          <div className="flex items-center gap-5 ml-auto">
            <button className="hover:text-orange-300 transition-colors flex items-center gap-1 cursor-pointer">
              <Mail size={12} /> Hỗ trợ kỹ thuật
            </button>
            <div className="h-3 w-px bg-white/20"></div>
            <div className="flex items-center gap-1.5 cursor-pointer group">
              <Globe
                size={12}
                className="group-hover:rotate-12 transition-transform"
              />
              <span>Tiếng Việt (VN)</span>
            </div>
          </div>
        </div>

        {!isLoginPage && (
          <div className="w-full mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
            <div
              className="cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-95"
              onClick={() => navigate("/")}
            >
              <img
                src={logo_iuh}
                alt="IUH Logo"
                className="h-10 md:h-12 object-contain"
              />
            </div>

            {!isLecturerPage && (
              <nav className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => navigate("/")}
                  className={getNavClass(null)}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => handleMenuItemClick("gioi-thieu")}
                  className={getNavClass("gioi-thieu")}
                >
                  Giới thiệu
                </button>
                <button
                  onClick={() => handleMenuItemClick("su-kien")}
                  className={getNavClass("su-kien")}
                >
                  Sự kiện
                </button>
                <a href="/attendance" className={getAttendanceClass()}>
                  Điểm danh
                </a>
                {hasLecturerAccess() && getManagementPath() && (
                  <a
                    href={getManagementPath()}
                    className={getManagementButtonClass()}
                  >
                    {getManagementButtonText()}
                  </a>
                )}
              </nav>
            )}

            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
              {/* Notification Bell */}
              {currentUser && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
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
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <Bell size={16} className="text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">
                                Thông báo
                              </h3>
                              {unreadCount > 0 && (
                                <p className="text-xs text-red-500">
                                  {unreadCount} thông báo chưa đọc
                                </p>
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

                        {/* Notifications List */}
                        <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
                          {notifications.length > 0 ? (
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

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                            <button
                              onClick={handleViewAll}
                              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 transition-colors group"
                            >
                              Xem tất cả thông báo
                              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {currentUser ? (
                <div className="relative" ref={menuRef}>
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="relative">
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                          {currentUser.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none">
                        {currentUser.fullName || currentUser.username}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-tighter">
                        {getPrimaryRole()}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-300 ${
                        isMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20"
                      >
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                              {currentUser.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">
                                {currentUser.username}
                              </p>
                              <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                                <ShieldCheck size={12} /> {getPrimaryRole()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <button
                            onClick={() => {
                              navigate("/userprofile");
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                          >
                            <User size={16} className="text-slate-400" /> Hồ sơ cá nhân
                          </button>
                          <button
                            onClick={() => {
                              navigate("/my-events");
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                          >
                            <Calendar size={16} className="text-slate-400" /> Sự kiện của tôi
                          </button>
                          <button
                            onClick={() => {
                              navigate("/settings");
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                          >
                            <Settings size={16} className="text-slate-400" /> Cài đặt tài khoản
                          </button>
                        </div>

                        <div className="p-2 bg-slate-50 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsLogoutModalOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            <LogOut size={16} /> Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="group flex items-center gap-2 bg-gradient-to-r hover:cursor-pointer from-[#1a479a] to-blue-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 uppercase tracking-wide"
                >
                  <LogIn
                    size={16}
                    className="group-hover:translate-x-1 transition-transform "
                  />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận đăng xuất?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {logoutToastVisible && (
        <div className="fixed top-6 right-6 z-[200] transform transition-all duration-500 ease-out translate-x-0 opacity-100 scale-100">
          <div className="relative overflow-hidden w-full max-w-xl
              bg-linear-to-r from-emerald-600 via-green-600 to-teal-600
              text-white rounded-2xl shadow-2xl shadow-green-900/40
              border border-white/10 backdrop-blur-xl">
            <div className="flex items-start gap-4 p-6">
              <div className="shrink-0">
                <div className="w-12 h-12 flex items-center justify-center
                    rounded-full bg-white/15 backdrop-blur-md
                    border border-white/20 shadow-inner">
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
        </div>
      )}
    </>
  );
};

export default Header;