import React, { useState, useEffect, useRef } from "react";
import { Bell, FileText, Send, CheckCircle, XCircle, Calendar, Mail, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";
import { useLanguage } from "../../../context/LanguageContext";
import NotificationDropdown from "../header/NotificationDropdown";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { language, t } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    await markAllAsRead();
    setIsMarkingAll(false);
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    if (user) {
      const role = user.role?.toUpperCase();
      if (role === "MEMBER") {
        navigate("/student/notifications");
      } else if (role === "LECTURER") {
        navigate("/lecturer/notifications");
      } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin/notifications");
      } else {
        // GUEST, STUDENT, etc.
        navigate("/notifications");
      }
    } else {
      navigate("/notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PLAN_CREATED": return <FileText size={18} className="text-emerald-500" />;
      case "PLAN_SUBMITTED": return <Send size={18} className="text-blue-500" />;
      case "PLAN_APPROVED": return <CheckCircle size={18} className="text-green-500" />;
      case "PLAN_REJECTED": return <XCircle size={18} className="text-red-500" />;
      case "EVENT_SUBMITTED": return <Send size={18} className="text-orange-500" />;
      case "EVENT_CREATED": return <Calendar size={18} className="text-purple-500" />;
      case "EVENT_APPROVED": return <CheckCircle size={18} className="text-green-500" />;
      case "EVENT_REJECTED": return <XCircle size={18} className="text-red-500" />;
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
      const t_now = "Đăng mới đây vừa xong" || "vừa xong";
      const t_min = "phút" || "phút trước";
      const t_hour = "giờ" || "giờ trước";

      if (diffInMs < 60000) return t_now;
      if (diffInMs < 3600000) return `${Math.floor(diffInMs / 60000)} ${t_min}`;
      if (diffInMs < 86400000) return `${Math.floor(diffInMs / 3600000)} ${t_hour}`;
      return date.toLocaleDateString(language === 'VI' ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch { return "Đăng mới đây vừa xong" || "vừa xong"; }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative
          w-10 h-10
          rounded-lg
          flex items-center justify-center
          transition
          ${isOpen
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
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        isMarkingAll={isMarkingAll}
        handleMarkAsRead={handleMarkAsRead}
        handleMarkAllAsRead={handleMarkAllAsRead}
        handleViewAllNotifications={handleViewAllNotifications}
        getNotificationIcon={getNotificationIcon}
        formatTime={formatTime}
        t={t}
        navigate={navigate}
      />
    </div>
  );
};

export default NotificationBell;
