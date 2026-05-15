import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle,
  Calendar,
  Clock,
  Info,
  XCircle,
  Mail,
  FileText,
  Send,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast.jsx";

// Components
import LanguageSelector from "./dashboard/LanguageSelector";
import NotificationBell from "./dashboard/NotificationBell";
import UserMenu from "./dashboard/UserMenu";
import LogoutModal from "./header/LogoutModal";

const roleMap = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  ADMIN: "Quản trị viên",
  LECTURER: "Giảng viên / Tổ chức",
  STUDENT: "Sinh viên",
  GUEST: "Người dùng",
};

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const notificationRef = useRef(null);
  const menuRef = useRef(null);

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

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      showToast("Đăng xuất thành công!", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      showToast("Lỗi khi đăng xuất", "error");
    }
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    const rolePrefix =
      user?.role?.toLowerCase() === "super_admin" || user?.role?.toLowerCase() === "admin"
        ? "admin"
        : "lecturer";
    navigate(`/${rolePrefix}/notifications`);
  };

  const getPrimaryRole = () => {
    const systemRole = user?.role?.toUpperCase() || "STUDENT";
    return roleMap[systemRole] || t(`role_${systemRole.toLowerCase()}`) || "Sinh viên";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    let normalizedDateString = dateString;
    if (typeof dateString === "string" && !dateString.includes("Z") && !dateString.includes("+")) {
      normalizedDateString = dateString.includes("T")
        ? `${dateString}Z`
        : `${dateString.replace(" ", "T")}Z`;
    }

    const date = new Date(normalizedDateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return t("time_now");
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${t("time_min")} ${language === "VI" ? "trước" : "ago"}`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${t("time_hour")} ${language === "VI" ? "trước" : "ago"}`;
    }
    return date.toLocaleDateString(language === "VI" ? "vi-VN" : "en-US");
  };

  const getNotificationIcon = (type) => {
    const icons = {
      PLAN_CREATED: <FileText size={18} className="text-emerald-500" />,
      PLAN_SUBMITTED: <Send size={18} className="text-blue-500" />,
      PLAN_APPROVED: <CheckCircle size={18} className="text-green-500" />,
      PLAN_REJECTED: <XCircle size={18} className="text-red-500" />,
      EVENT_SUBMITTED: <Send size={18} className="text-orange-500" />,
      EVENT_CREATED: <Calendar size={18} className="text-purple-500" />,
      EVENT_APPROVED: <CheckCircle size={18} className="text-green-500" />,
      EVENT_REJECTED: <XCircle size={18} className="text-red-500" />,
      REGISTRATION_CONFIRMED: <CheckCircle size={18} className="text-blue-500" />,
      INVITATION: <Mail size={18} className="text-amber-500" />,
      SYSTEM: <Info size={18} className="text-purple-500" />,
    };
    return icons[type] || <Bell size={18} className="text-slate-400" />;
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 rounded-full bg-[#1E40AF]" />

          <h2 className="hidden md:block text-sm font-bold text-slate-700 tracking-wide">
            {t("admin_dashboard_title")}
          </h2>
        </div>

        <div className="flex items-center gap-4 h-full">
          <LanguageSelector language={language} setLanguage={setLanguage} />

          <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />

          <div className="flex items-center gap-4">
            {/* Quick Access QR Scanner */}
            {!(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "LECTURER") && (
              <button
                onClick={() => navigate("/attendance")}
                className="p-2.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group relative"
                title={t("qr_scan")}
              >
                <QrCode size={20} strokeWidth={2.5} />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full shadow-sm" />
              </button>
            )}

            <NotificationBell
              isOpen={isNotificationOpen}
              setIsOpen={setIsNotificationOpen}
              notificationRef={notificationRef}
              unreadCount={unreadCount}
              notifications={notifications}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              formatTime={formatTime}
              getNotificationIcon={getNotificationIcon}
              handleViewAll={handleViewAll}
              t={t}
              navigate={navigate}
            />

            <UserMenu
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              menuRef={menuRef}
              user={user}
              getPrimaryRole={getPrimaryRole}
              setIsLogoutModalOpen={setIsLogoutModalOpen}
              t={t}
              navigate={navigate}
            />
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        setIsOpen={setIsLogoutModalOpen}
        handleLogout={handleLogout}
        t={t}
      />
    </>
  );
};

export default DashboardHeader;
