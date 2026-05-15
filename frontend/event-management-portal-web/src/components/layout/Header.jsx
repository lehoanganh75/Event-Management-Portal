import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogIn,
  Bell,
  Menu,
  QrCode,
  LayoutDashboard,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import logo_iuh from "../../assets/images/logo_iuh.png";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import notificationService from "../../services/notificationService";
import { showToast } from "../../utils/toast.jsx";

// Sub-components
import TopBar from "./header/TopBar";
import DesktopNav from "./header/DesktopNav";
import NotificationDropdown from "./header/NotificationDropdown";
import UserProfileMenu from "./header/UserProfileMenu";
import MobileDrawer from "./header/MobileDrawer";
import LogoutModal from "./header/LogoutModal";

const roleKeyMap = {
  SUPER_ADMIN: "role_super_admin",
  ADMIN: "role_admin",
  LECTURER: "role_lecturer",
  STUDENT: "role_student",
  MEMBER: "role_member",
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

      const wsBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const token = localStorage.getItem('accessToken');
      const wsUrl = token ? `${wsBaseUrl}/ws?token=${token}` : `${wsBaseUrl}/ws`;

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        onConnect: () => {
          client.subscribe(`/topic/notifications.${user.id}`, (message) => {
            const newNotif = JSON.parse(message.body);
            setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
            setUnreadCount((prev) => prev + 1);
            showToast(newNotif.title, "info");
          });
        },
      });

      client.activate();
      return () => client.deactivate();
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error(error); }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast(t('all_marked_read'), "success");
    } catch (error) { console.error(error); }
    finally { setIsMarkingAll(false); }
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/notifications");
  };

  const getPrimaryRole = () => {
    if (!user?.role) return t('role_student');
    const rawRole = user.role;
    const systemRole = rawRole.toUpperCase();

    if (systemRole === "SUPER_ADMIN" || systemRole === "ADMIN") {
      return t(roleKeyMap[systemRole]) || (systemRole === "ADMIN" ? t('role_admin') : t('role_super_admin'));
    }

    if (user?.eventRoles && user.eventRoles.length > 0) {
      const eRole = user.eventRoles[0];
      return t(roleKeyMap[eRole]) || eRole;
    }

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
      const t_now = t('time_now') || "vừa xong";
      const t_min = t('time_min') || "phút trước";
      const t_hour = t('time_hour') || "giờ trước";

      if (diffInMs < 60000) return t_now;
      if (diffInMs < 3600000) return `${Math.floor(diffInMs / 60000)} ${t_min}`;
      if (diffInMs < 86400000) return `${Math.floor(diffInMs / 3600000)} ${t_hour}`;
      return date.toLocaleDateString(language === 'VI' ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch { return t('time_now') || "vừa xong"; }
  };

  const isSuperAdmin = () => user?.role?.toUpperCase() === "SUPER_ADMIN";
  const isAdminOnly = () => user?.role?.toUpperCase() === "ADMIN";
  const isEventStaff = () => user?.eventRoles && user.eventRoles.length > 0;
  const isLeaderRole = () => user?.eventRoles?.some(role => role.toUpperCase() === 'LEADER');
  const hasRole = (roleName) => user?.role?.toUpperCase() === roleName.toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      showToast(language === 'VI' ? "Đăng xuất thành công. Hẹn gặp lại bạn!" : "Logged out successfully!", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) { console.error(error); }
  };

  const isLoginPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  if (authLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Đang tải...</span>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50">
        <TopBar t={t} language={language} setLanguage={setLanguage} />

        <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-16 h-[72px] flex items-center justify-between gap-6">

            {/* LEFT */}
            <div className="flex items-center gap-3 shrink-0">

              {/* Mobile menu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
              >
                <Menu size={22} />
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <img
                  src={logo_iuh}
                  alt="IUH Logo"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* CENTER NAV */}
            {!isLoginPage && (
              <div className="hidden lg:flex flex-1 justify-center">
                <DesktopNav
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  t={t}
                />
              </div>
            )}

            {/* RIGHT */}
            <div className="flex items-center gap-2 shrink-0">

              {/* QR */}
              <button
                onClick={() => navigate("/attendance")}
                className="
                  h-10 px-4
                  hidden md:flex
                  items-center gap-2
                  rounded-lg
                  border border-slate-200
                  bg-white
                  hover:bg-slate-50
                  text-slate-700
                  transition
                "
              >
                <QrCode size={18} />

                <span className="text-[12px] font-medium">
                  {t("qr_scan")}
                </span>
              </button>

              {isAuthenticated && user ? (
                <>
                  {/* Dashboard */}
                  {(isEventStaff() || isAdminOnly() || isSuperAdmin() || hasRole("MEMBER") || hasRole("LECTURER")) && (
                    <Link
                      to={
                        isSuperAdmin() || isAdminOnly()
                          ? "/admin/dashboard"
                          : hasRole("MEMBER")
                            ? "/student/events"
                            : isLeaderRole()
                              ? "/lecturer/dashboard"
                              : "/lecturer/events"
                      }
                      className="
                  hidden sm:flex
                  h-10 px-4
                  items-center gap-2
                  rounded-lg
                  bg-[#1E40AF]
                  hover:bg-[#1D4ED8]
                  text-white
                  transition
                "
                    >
                      <LayoutDashboard size={18} />

                      <span className="text-[12px] font-medium">
                        Dashboard
                      </span>
                    </Link>
                  )}

                  {/* Notification */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() =>
                        setIsNotificationOpen(!isNotificationOpen)
                      }
                      className={`
                  relative
                  w-10 h-10
                  rounded-lg
                  flex items-center justify-center
                  transition
                  ${isNotificationOpen
                          ? "bg-blue-50 text-[#1E40AF]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                `}
                    >
                      <Bell size={19} />

                      {unreadCount > 0 && (
                        <span
                          className="
                      absolute -top-1 -right-1
                      min-w-[18px] h-[18px]
                      px-1
                      rounded-full
                      bg-red-500
                      text-white
                      text-[10px]
                      font-semibold
                      flex items-center justify-center
                      border-2 border-white
                    "
                        >
                          {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                        </span>
                      )}
                    </button>

                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      notifications={notifications}
                      unreadCount={unreadCount}
                      isMarkingAll={isMarkingAll}
                      handleMarkAsRead={handleMarkAsRead}
                      handleMarkAllAsRead={handleMarkAllAsRead}
                      handleViewAllNotifications={
                        handleViewAllNotifications
                      }
                      getNotificationIcon={getNotificationIcon}
                      formatTime={formatTime}
                      t={t}
                      navigate={navigate}
                    />
                  </div>

                  {/* User */}
                  <UserProfileMenu
                    isOpen={isMenuOpen}
                    setIsOpen={setIsMenuOpen}
                    user={user}
                    getPrimaryRole={getPrimaryRole}
                    isSuperAdmin={isSuperAdmin}
                    isAdminOnly={isAdminOnly}
                    hasRole={hasRole}
                    isEventStaff={isEventStaff}
                    setIsLogoutModalOpen={setIsLogoutModalOpen}
                    t={t}
                    menuRef={menuRef}
                    navigate={navigate}
                  />
                </>
              ) : (
                <Link
                  to="/login"
                  className="
              h-10 px-5
              flex items-center gap-2
              rounded-lg
              bg-[#1E40AF]
              hover:bg-[#1D4ED8]
              text-white
              transition
            "
                >
                  <LogIn size={18} />

                  <span className="text-[12px] font-medium">
                    {t("login")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        setIsOpen={setIsLogoutModalOpen}
        handleLogout={handleLogout}
        t={t}
      />

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        user={user}
        isAuthenticated={isAuthenticated}
        activeSection={activeSection}
        getPrimaryRole={getPrimaryRole}
        isSuperAdmin={isSuperAdmin}
        isAdminOnly={isAdminOnly}
        isEventStaff={isEventStaff}
        isLeaderRole={isLeaderRole}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
        language={language}
        setLanguage={setLanguage}
        t={t}
        navigate={navigate}
      />
    </>
  );
};

export default Header;