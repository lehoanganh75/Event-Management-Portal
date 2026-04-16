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
  Info,
} from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api/notificationApi";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên Cao Cấp",
  ADMIN: "Quản Trị Viên",
  MEMBER: "Sinh Viên",
  GUEST: "Người dùng",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

  // State
  const [activeSection, setActiveSection] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  const lockActiveRef = useRef(false);
  const lockTimerRef = useRef(null);

  // ====================== FETCH NOTIFICATIONS ======================
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [countRes, recentRes] = await Promise.all([
        notificationApi.get.unreadCount(user.id),
        notificationApi.get.recent(user.id, 5),
      ]);

      setUnreadCount(countRes.data || 0);
      setNotifications(recentRes.data || []);
    } catch (error) {
      console.error("Lỗi fetch thông báo:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Click outside để đóng Notification
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click outside để đóng User Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto hide logout toast
  useEffect(() => {
    if (logoutToastVisible) {
      const timer = setTimeout(() => setLogoutToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoutToastVisible]);

  // ====================== NOTIFICATION HANDLERS ======================
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.actions.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    setIsMarkingAll(true);
    try {
      await notificationApi.actions.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    const primaryRole = user?.roles?.[0];

    if (["SUPER_ADMIN", "ADMIN"].includes(primaryRole)) {
      navigate("/admin/notifications");
    } else {
      navigate(`/notifications/${user.id}`);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      EVENT_APPROVED: <CheckCircle size={20} className="text-green-500" />,
      EVENT_REJECTED: <XCircle size={20} className="text-red-500" />,
      REGISTRATION_CONFIRMED: <Calendar size={20} className="text-blue-500" />,
      CHECKIN_REMINDER: <Clock size={20} className="text-orange-500" />,
      SYSTEM: <Info size={20} className="text-purple-500" />,
      PROMOTION: <AlertCircle size={20} className="text-pink-500" />,
    };
    return icons[type] || <Bell size={20} className="text-slate-400" />;
  };

  const getNotificationBgColor = (notification) =>
    !notification.read
      ? "bg-gradient-to-r from-blue-50/80 to-transparent"
      : "hover:bg-slate-50";

  // ====================== ACTIVE SECTION ======================
  const checkActiveSection = useCallback(() => {
    if (lockActiveRef.current || location.pathname !== "/") {
      setActiveSection(null);
      return;
    }
    if (isScrollingRef.current) return;

    const sections = ["gioi-thieu", "su-kien"];
    let foundSection = null;
    let maxVisiblePercent = 0;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleHeight = Math.max(
        0,
        Math.min(viewportHeight, rect.bottom) - Math.max(0, rect.top)
      );
      const visiblePercent = (visibleHeight / rect.height) * 100;

      if (visiblePercent > maxVisiblePercent) {
        maxVisiblePercent = visiblePercent;
        foundSection = section;
      }
    }

    setActiveSection(maxVisiblePercent > 20 ? foundSection : null);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const handleScroll = () => {
      if (timeoutRef.current) cancelAnimationFrame(timeoutRef.current);
      timeoutRef.current = requestAnimationFrame(checkActiveSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(checkActiveSection, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) cancelAnimationFrame(timeoutRef.current);
    };
  }, [location.pathname, checkActiveSection]);

  // ====================== HELPER FUNCTIONS ======================
  const getPrimaryRole = () => roleMap[user?.roles?.[0]] || "Thành viên";

  const hasManagementAccess = () =>
    user?.roles?.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r));

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

  const handleMenuItemClick = (itemId) => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockActiveRef.current = true;
    isScrollingRef.current = true;
    setActiveSection(itemId);

    const scrollToSection = () => {
      const el = document.getElementById(itemId);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
      }
      setTimeout(() => {
        isScrollingRef.current = false;
        lockActiveRef.current = false;
      }, 800);
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
      await logout();
      setIsLogoutModalOpen(false);
      setLogoutToastVisible(true);
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isLoginPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  // ====================== LOADING STATE ======================
  if (authLoading) {
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
        {/* Top Bar */}
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
              <Globe size={12} className="group-hover:rotate-12 transition-transform" />
              <span>Tiếng Việt (VN)</span>
            </div>
          </div>
        </div>

        {!isLoginPage && (
          <div className="w-full mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <div
              className="cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-95"
              onClick={() => navigate("/")}
            >
              <img src={logo_iuh} alt="IUH Logo" className="h-10 md:h-12 object-contain" />
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <button onClick={() => navigate("/")} className={getNavClass(null)}>
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

              {hasManagementAccess() && (
                <a href="/admin" className="ml-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100">
                  Quản trị
                </a>
              )}
            </nav>

            {/* Right Side: Notification + User */}
            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
              {/* Notification Bell */}
              {isAuthenticated && user && (
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
                        {/* Notification Header */}
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

                        {/* Notification List */}
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
                              <p className="text-sm font-medium text-slate-500 mb-1">Không có thông báo</p>
                              <p className="text-xs text-slate-400">Bạn sẽ nhận được thông báo khi có hoạt động mới</p>
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

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative" ref={menuRef}>
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-tighter">
                        {getPrimaryRole()}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
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
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{user.username}</p>
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
                  className="group flex items-center gap-2 bg-gradient-to-r from-[#1a479a] to-blue-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 uppercase tracking-wide"
                >
                  <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Modal */}
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
              <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Xác nhận đăng xuất?</h2>
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
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Success Toast */}
      {logoutToastVisible && (
        <div className="fixed top-6 right-6 z-[200]">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl shadow-green-900/40 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="flex items-start gap-4 p-6">
              <div className="shrink-0">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/15 border border-white/20">
                  <CheckCircle size={26} className="text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-lg tracking-tight">Thành công</p>
                <p className="mt-1 text-white/90 text-sm">Đăng xuất thành công!</p>
              </div>
              <button
                onClick={() => setLogoutToastVisible(false)}
                className="shrink-0 p-2 rounded-full hover:bg-white/15 transition"
              >
                <X size={20} className="text-white/80" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;