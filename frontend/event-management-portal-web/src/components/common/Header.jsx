import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";

import logo_iuh from "../../assets/images/logo_iuh.png";
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [logoutToastVisible, setLogoutToastVisible] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Navigation state (Scroll Spy)
  const [activeSection, setActiveSection] = useState("home");

  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
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
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll Spy logic
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== "/") return;

      const scrollPosition = window.scrollY;
      const eventSection = document.getElementById("su-kien");
      
      if (eventSection) {
        const sectionTop = eventSection.offsetTop - 200;
        if (scrollPosition >= sectionTop) {
          setActiveSection("events");
        } else {
          setActiveSection("home");
        }
      } else {
        // Fallback if element not found
        if (scrollPosition > 400) {
          setActiveSection("events");
        } else {
          setActiveSection("home");
        }
      }
    };

    if (location.pathname === "/") {
      window.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();
    } else if (location.pathname.startsWith("/events")) {
      setActiveSection("events");
    } else if (location.pathname === "/calendar") {
      setActiveSection("calendar");
    } else if (location.pathname === "/news") {
      setActiveSection("news");
    } else {
      setActiveSection("");
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Auto hide toast
  useEffect(() => {
    if (logoutToastVisible) {
      const timer = setTimeout(() => setLogoutToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoutToastVisible]);

  const getPrimaryRole = () => {
    const rawRole = user?.role || user?.roles?.[0] || "";
    const cleanRole = rawRole.toUpperCase();
    return roleMap[cleanRole] || roleMap[rawRole] || "Thành viên";
  };

  const hasManagementAccess = () =>
    user?.roles?.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r));

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      setLogoutToastVisible(true);
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      console.error(error);
    }
  };

  const isLoginPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  if (authLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="bg-gradient-to-r from-[#1a479a] to-[#2563eb] text-white py-2 px-6 flex justify-between items-center">
          <div>Hệ thống Quản lý Sự kiện IUH</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Đang tải...
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-[#1a479a] to-[#2563eb] text-white py-1.5 px-4 md:px-10 text-xs flex justify-between items-center">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Hệ thống Quản lý Sự kiện IUH
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href="mailto:support@iuh.edu.vn" className="hover:text-orange-200 flex items-center gap-1">
              <Mail size={13} /> Hỗ trợ kỹ thuật
            </a>
            <div className="h-3 w-px bg-white/30" />
            <div className="flex items-center gap-1 cursor-pointer">
              <Globe size={13} /> Tiếng Việt
            </div>
          </div>
        </div>

        {!isLoginPage && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="hover:opacity-90 transition">
              <img src={logo_iuh} alt="IUH Logo" className="h-11 md:h-12 object-contain" />
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setActiveSection("home");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === "home" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Trang chủ
              </Link>

              <Link
                to="/#su-kien"
                onClick={(e) => {
                  setActiveSection("events");
                  if (location.pathname === '/') {
                    const el = document.getElementById("su-kien");
                    if (el) {
                      const yOffset = -140;
                      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === "events" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Sự kiện
              </Link>
              <Link
                to="/calendar"
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === "calendar" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Lịch sự kiện
              </Link>
              <Link
                to="/news"
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === "news" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Tin tức
              </Link>

              {hasManagementAccess() && (
                <Link
                  to="/admin"
                  className="ml-4 px-5 py-2.5 rounded-xl text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100"
                >
                  Quản trị
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              {isAuthenticated && user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-3 hover:bg-slate-100 rounded-2xl relative transition-colors"
                  >
                    <Bell size={22} className="text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown - Bạn có thể paste phần chi tiết dropdown từ code cũ vào đây */}
                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                        ref={notificationRef}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-linear-to-r from-blue-50 to-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center">
                              <Bell size={20} className="text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">Thông báo</h3>
                              {unreadCount > 0 && (
                                <p className="text-xs text-red-500 font-medium">
                                  {unreadCount} thông báo chưa đọc
                                </p>
                              )}
                            </div>
                          </div>

                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              disabled={isMarkingAll}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {isMarkingAll ? (
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-115 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                className={`px-6 py-4 cursor-pointer transition-all hover:bg-slate-50 ${
                                  !notification.read ? "bg-blue-50/60" : ""
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <p className={`text-[15px] leading-tight ${
                                        !notification.read ? "font-semibold text-slate-900" : "text-slate-700"
                                      }`}>
                                        {notification.title}
                                      </p>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                      )}
                                    </div>

                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>

                                    <div className="mt-2 flex items-center text-xs text-slate-400">
                                      <Clock size={13} className="mr-1" />
                                      {formatTime(notification.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="py-16 text-center">
                              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <Bell size={32} className="text-slate-300" />
                              </div>
                              <p className="mt-4 text-slate-500 font-medium">Không có thông báo mới</p>
                              <p className="text-xs text-slate-400 mt-1">Bạn sẽ nhận được thông báo khi có cập nhật</p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                              onClick={handleViewAllNotifications}
                              className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white rounded-2xl transition"
                            >
                              Xem tất cả thông báo
                              <ChevronRight size={18} />
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
                    className="flex items-center gap-3 cursor-pointer p-1 pr-4 rounded-full hover:bg-slate-100 transition"
                  >
                    <div className="relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md border-2 border-white">
                          {user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-800">{user.fullName || user.username}</p>
                      <p className="text-xs text-slate-500 -mt-0.5">{getPrimaryRole()}</p>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                  </div>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 ring-4 ring-white shadow-md rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white text-3xl font-bold">
                                  {user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-lg text-slate-800 truncate">
                                {user.fullName || user.username}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                  <ShieldCheck size={12} />
                                </div>
                                <p className="text-sm text-blue-600 font-medium">
                                  {getPrimaryRole()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            to="/userprofile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-slate-700 hover:bg-slate-100 rounded-2xl transition-all active:bg-slate-200"
                          >
                            <User size={20} className="text-slate-500" />
                            Hồ sơ cá nhân
                          </Link>

                          <Link
                            to="/my-events"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-slate-700 hover:bg-slate-100 rounded-2xl transition-all active:bg-slate-200"
                          >
                            <Calendar size={20} className="text-slate-500" />
                            Sự kiện của tôi
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-slate-700 hover:bg-slate-100 rounded-2xl transition-all active:bg-slate-200"
                          >
                            <Settings size={20} className="text-slate-500" />
                            Cài đặt
                          </Link>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 my-1" />

                        {/* Logout Button */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsLogoutModalOpen(true);
                            }}
                            className="w-full flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-all active:bg-red-100"
                          >
                            <LogOut size={20} className="text-red-500" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-semibold text-sm transition shadow-sm"
                >
                  <LogIn size={18} />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <LogOut size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Đăng xuất?</h2>
              <p className="text-gray-600 mb-8">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl font-medium bg-red-500 text-white hover:bg-red-600 transition"
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
          <div className="bg-emerald-600 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
            <CheckCircle size={28} />
            <div>
              <p className="font-semibold">Đăng xuất thành công</p>
              <p className="text-sm text-emerald-100">Hẹn gặp lại bạn!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;