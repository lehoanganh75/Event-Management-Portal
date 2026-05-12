import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { showToast } from "../../utils/toast.jsx";
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
  ChevronRight as ChevronRightIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  LayoutDashboard,
  FileText,
  Send,
  QrCode,
  Menu,
  Home,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import logo_iuh from "../../assets/images/logo_iuh.png";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import notificationService from "../../services/notificationService";

const roleKeyMap = {
  SUPER_ADMIN: "role_super_admin",
  ADMIN: "role_admin",
  LECTURER: "role_lecturer",
  STUDENT: "role_student",
  MEMBER: "role_student",
  LEADER: "role_leader",
  SUB_LEADER: "role_sub_leader",
  SECRETARY: "role_secretary",
  MEMBER_ORG: "role_member_org",
  GUEST: "role_guest",
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  // Navigation state (Scroll Spy)
  const [activeSection, setActiveSection] = useState("home");

  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [countRes, recentRes] = await Promise.all([
        notificationService.getUnreadCount(user.id),
        notificationService.getRecentNotifications(user.id, 5),
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

      // Cấu hình STOMP client
      const stompClient = new Client({
        brokerURL: "ws://localhost:8085/ws", // Kết nối trực tiếp đến Notification service
        // Nếu dùng SockJSfallback
        webSocketFactory: () => new SockJS("http://localhost:8085/ws"),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("Connected to WebSocket for user:", user.id);
          // Subscribe vào topic định danh của user
          stompClient.subscribe(`/topic/notifications.${user.id}`, (message) => {
            if (message.body) {
              const newNotification = JSON.parse(message.body);
              console.log("Nhận thông báo mới từ WebSocket:", newNotification);

              // Cập nhật state ngay lập tức
              setNotifications(prev => [newNotification, ...prev].slice(0, 10));
              setUnreadCount(prev => prev + 1);

              // Hiển thị thông báo góc trên bên phải (Toast)
              showToast(
                <div className="flex flex-col gap-0.5">
                  <p className="font-bold text-[13px]">{newNotification.title}</p>
                  <p className="text-[11px] opacity-80 line-clamp-2">{newNotification.message}</p>
                </div>,
                'info'
              );
            }
          });
        },
        onStompError: (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
        },
      });

      stompClient.activate();

      return () => {
        if (stompClient.active) {
          stompClient.deactivate();
        }
      };
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast("Đã đánh dấu tất cả là đã đọc", "success");
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
      toast.error("Không thể đánh dấu tất cả đã đọc");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/notifications");
  };

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Set active section based on current path
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveSection("home");
    } else if (location.pathname.startsWith("/events")) {
      setActiveSection("events");
    } else if (location.pathname === "/calendar") {
      setActiveSection("calendar");
    } else if (location.pathname === "/news") {
      setActiveSection("news");
    } else {
      setActiveSection("");
    }
  }, [location.pathname]);
  // Removed logoutToastVisible useEffect

  const getPrimaryRole = () => {
    const rawRole = user?.role || "";
    const systemRole = rawRole.toUpperCase();

    // 1. Ưu tiên các vai trò quản trị hệ thống (SUPER_ADMIN, ADMIN)
    if (systemRole === "SUPER_ADMIN" || systemRole === "ADMIN") {
      return t(roleKeyMap[systemRole]) || (systemRole === "ADMIN" ? t('role_admin') : t('role_super_admin'));
    }

    // 2. Tiếp theo là vai trò trong sự kiện (LEADER, SECRETARY...) dành cho MEMBER/LECTURER
    if (user?.eventRoles && user.eventRoles.length > 0) {
      const eRole = user.eventRoles[0];
      return t(roleKeyMap[eRole]) || eRole;
    }

    // 3. Cuối cùng hiển thị vai trò hệ thống khác (LECTURER, MEMBER)
    return t(roleKeyMap[systemRole]) || t(roleKeyMap[rawRole]) || t('role_student');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PLAN_CREATED": return <FileText size={18} className="text-emerald-500" />;
      case "PLAN_SUBMITTED": return <Send size={18} className="text-blue-500" />;
      case "PLAN_APPROVED": return <CheckCircle size={18} className="text-green-500" />;
      case "PLAN_REJECTED": return <XCircle size={18} className="text-red-500" />;
      case "EVENT_SUBMITTED": return <Send size={18} className="text-orange-500" />;
      case "EVENT_CREATED": return <Calendar size={18} className="text-purple-500" />;
      case "REGISTRATION_CONFIRMED": return <Mail size={18} className="text-blue-500" />;
      case "INVITATION": return <Mail size={18} className="text-amber-500" />;
      case "SYSTEM": return <Info size={18} className="text-slate-500" />;
      case "GENERAL": return <Bell size={18} className="text-blue-500" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return language === 'VI' ? "Không xác định" : "Unknown";
    try {
      let date;
      if (typeof dateString === 'string' && !dateString.includes('Z') && !dateString.includes('+')) {
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      } else {
        date = new Date(dateString);
      }

      const now = new Date();
      const diffInMs = now - date;
      if (diffInMs < 60000) return t('time_now');
      if (diffInMs < 3600000) return `${Math.floor(diffInMs / 60000)} ${t('time_min')}`;
      if (diffInMs < 86400000) return `${Math.floor(diffInMs / 3600000)} ${t('time_hour')}`;
      return date.toLocaleDateString(language === 'VI' ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch { return t('time_now'); }
  };

  const isSuperAdmin = () => {
    return user?.role?.toUpperCase() === "SUPER_ADMIN";
  };

  const isAdminOnly = () => {
    return user?.role?.toUpperCase() === "ADMIN";
  };

  const isEventStaff = () => {
    return user?.eventRoles && user.eventRoles.length > 0;
  };

  const isLeaderRole = () => {
    return user?.eventRoles?.some(role => role.toUpperCase() === 'LEADER');
  };

  const hasRole = (roleName) => {
    return user?.role?.toUpperCase() === roleName.toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      showToast("Đăng xuất thành công. Hẹn gặp lại bạn!", "success");
      setTimeout(() => navigate("/"), 1500);
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
            {t('system_name')}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href="https://www.facebook.com/sviuh/?locale=vi_VN" className="hover:text-orange-200 flex items-center gap-1">
              <Mail size={13} /> {t('support')}
            </a>
            <div className="h-3 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <div
                onClick={() => setLanguage("VI")}
                className={`cursor-pointer transition-all ${language === "VI" ? "font-bold text-orange-300" : "opacity-60 hover:opacity-100"}`}
              >
                VI
              </div>
              <div className="w-px h-2 bg-white/20" />
              <div
                onClick={() => setLanguage("EN")}
                className={`cursor-pointer transition-all ${language === "EN" ? "font-bold text-orange-300" : "opacity-60 hover:opacity-100"}`}
              >
                EN
              </div>
            </div>
          </div>
        </div>

        {!isLoginPage && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            {/* Left: Logo & Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
              >
                <Menu size={24} />
              </button>
              <Link to="/" className="hover:opacity-90 transition">
                <img src={logo_iuh} alt="IUH Logo" className="h-10 md:h-12 object-contain" />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setActiveSection("home");
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "home" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                  }`}
              >
                {t('home')}
              </Link>

              <Link
                to="/events"
                onClick={() => setActiveSection("events")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "events" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                  }`}
              >
                {t('events')}
              </Link>

              <Link
                to="/calendar"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "calendar" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                  }`}
              >
                {t('calendar')}
              </Link>
              <Link
                to="/news"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "news" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-700"
                  }`}
              >
                {t('news')}
              </Link>

              {/* Organizer Link next to News */}
              {(isEventStaff() || isAdminOnly() || isSuperAdmin()) && (
                <Link
                  to={isSuperAdmin() || isAdminOnly() ? "/admin/dashboard" : (isLeaderRole() ? "/lecturer/dashboard" : "/lecturer/events")}
                  className="ml-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  {isAdminOnly() || isSuperAdmin() ? t('admin_dashboard') : t('org_dashboard')}
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* QR Scanner Button */}
              <button
                onClick={() => navigate("/attendance")}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 flex items-center gap-1.5 group"
                title={t('qr_scan')}
              >
                <QrCode size={20} className="group-hover:text-blue-600 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-tighter hidden xl:block group-hover:text-blue-600 transition-colors">{t('qr_scan')}</span>
              </button>

              {/* Notification Bell */}
              {isAuthenticated && user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2.5 hover:bg-slate-100 rounded-xl relative transition-colors"
                  >
                    <Bell size={20} className="text-slate-600" />
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
                              <h3 className="font-semibold text-slate-800">{t('notifications')}</h3>
                              {unreadCount > 0 && (
                                <p className="text-xs text-red-500 font-medium">
                                  {unreadCount} {t('unread_notifications') || (language === 'VI' ? 'thông báo chưa đọc' : 'unread notifications')}
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
                              {t('mark_all_read')}
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
                                onClick={() => {
                                  if (!notification.read) handleMarkAsRead(notification.id);
                                  if (notification.actionUrl) {
                                    setIsNotificationOpen(false);
                                    navigate(notification.actionUrl);
                                  }
                                }}
                                className={`px-6 py-4 cursor-pointer transition-all hover:bg-slate-50 ${!notification.read ? "bg-blue-50/60" : ""
                                  }`}
                              >
                                <div className="flex gap-4">
                                  <div className="mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <p className={`text-[15px] leading-tight ${!notification.read ? "font-semibold text-slate-900" : "text-slate-700"
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
                              <p className="mt-4 text-slate-500 font-medium">{t('no_notifications')}</p>
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
                              {t('view_all_notifications')}
                              <ChevronRightIcon size={18} />
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
                            to={isSuperAdmin() || isAdminOnly() || hasRole('LECTURER') || isEventStaff() ?
                              (hasRole('ADMIN') || hasRole('SUPER_ADMIN') ? "/admin/profile" : "/lecturer/profile")
                              : "/profile"}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-slate-700 hover:bg-slate-100 rounded-2xl transition-all active:bg-slate-200"
                          >
                            <User size={20} className="text-slate-500" />
                            {t('profile')}
                          </Link>

                          {/* Dashboard Link based on Role */}
                          {isSuperAdmin() && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-orange-600 hover:bg-orange-50 rounded-2xl transition-all active:bg-orange-100"
                            >
                              <LayoutDashboard size={20} className="text-orange-500" />
                              {t('admin_dashboard')}
                            </Link>
                          )}

                          {isAdminOnly() && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:bg-blue-100"
                            >
                              <LayoutDashboard size={20} className="text-blue-500" />
                              {t('admin_dashboard')}
                            </Link>
                          )}

                          {(hasRole('LECTURER') || isEventStaff()) && !isAdminOnly() && !isSuperAdmin() && (
                            <Link
                              to="/lecturer/dashboard"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:bg-indigo-100"
                            >
                              <LayoutDashboard size={20} className="text-indigo-500" />
                              {t('org_dashboard')}
                            </Link>
                          )}

                          {/* Student 'My Events' for regular students/guests */}
                          {!isSuperAdmin() && !isAdminOnly() && !hasRole('LECTURER') && !isEventStaff() && (
                            <Link
                              to="/guest-events"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all active:bg-emerald-100"
                            >
                              <Calendar size={20} className="text-emerald-500" />
                              {t('my_events')}
                            </Link>
                          )}


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
                            {t('logout')}
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
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                  <LogOut size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">{t('logout')}?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{t('confirm_logout')}</p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {t('logout')}
                  </button>
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Success Toast removed in favor of global showToast */}

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[101] w-[280px] bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <img src={logo_iuh} alt="Logo" className="h-8 object-contain" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <Link
                  to="/"
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeSection === "home" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Home size={20} />
                  {t('home')}
                </Link>

                <Link
                  to="/events"
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeSection === "events" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Calendar size={20} />
                  {t('events')}
                </Link>

                <Link
                  to="/calendar"
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeSection === "calendar" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Clock size={20} />
                  {t('calendar')}
                </Link>

                <Link
                  to="/news"
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeSection === "news" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <MessageSquare size={20} />
                  {t('news')}
                </Link>

                {(isEventStaff() || isAdminOnly() || isSuperAdmin()) && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('management') || (language === 'VI' ? 'QUẢN LÝ' : 'MANAGEMENT')}</p>
                    <Link
                      to={isSuperAdmin() || isAdminOnly() ? "/admin/dashboard" : (isLeaderRole() ? "/lecturer/dashboard" : "/lecturer/events")}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold bg-indigo-50 text-indigo-600 transition-all"
                    >
                      <LayoutDashboard size={20} />
                      {isAdminOnly() || isSuperAdmin() ? t('admin_dashboard') : t('org_dashboard')}
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{t('language') || (language === 'VI' ? 'Ngôn ngữ' : 'Language')}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setLanguage("VI")} className={language === "VI" ? "text-blue-600 font-bold" : ""}>VI</button>
                    <div className="w-px h-3 bg-slate-300" />
                    <button onClick={() => setLanguage("EN")} className={language === "EN" ? "text-blue-600 font-bold" : ""}>EN</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;