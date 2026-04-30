import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, CheckCircle, Calendar, Clock, X, Check, Info, XCircle, Mail, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { showToast } from "../../utils/toast.jsx";

const roleMap = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  ADMIN: "Quản trị viên",
  LECTURER: "Giảng viên / Tổ chức",
  STUDENT: "Sinh viên"
};

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

  const handleLogoutAction = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      showToast("Đăng xuất thành công!", "success");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    const rolePrefix = user?.role?.toLowerCase() === 'super_admin' || user?.role?.toLowerCase() === 'admin' ? 'admin' : 'lecturer';
    navigate(`/${rolePrefix}/notifications`);
  };

  const getPrimaryRole = () => {
    const systemRole = user?.role?.toUpperCase() || "";
    return roleMap[systemRole] || "Sinh viên";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'PLAN_CREATED': <FileText size={18} className="text-emerald-500" />,
      'PLAN_SUBMITTED': <Send size={18} className="text-blue-500" />,
      'PLAN_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'PLAN_REJECTED': <XCircle size={18} className="text-red-500" />,
      'EVENT_SUBMITTED': <Send size={18} className="text-orange-500" />,
      'EVENT_CREATED': <Calendar size={18} className="text-purple-500" />,
      'EVENT_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'EVENT_REJECTED': <XCircle size={18} className="text-red-500" />,
      'REGISTRATION_CONFIRMED': <CheckCircle size={18} className="text-blue-500" />,
      'INVITATION': <Mail size={18} className="text-amber-500" />,
      'SYSTEM': <Info size={18} className="text-purple-500" />,
    };
    return icons[type] || <Bell size={18} className="text-slate-400" />;
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <h2 className="text-sm font-black text-slate-800/40 uppercase tracking-[0.2em] hidden md:block border-l-4 border-indigo-500 pl-4 py-1">
          Bảng điều khiển hệ thống
        </h2>
      </div>

      <div className="flex items-center gap-4 h-full">
        <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`
              relative p-2.5 text-slate-500 rounded-xl transition-all duration-200
              ${isNotificationOpen ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'hover:bg-slate-100 hover:text-slate-800'}
            `}
            >
              <Bell size={20} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-extrabold text-slate-800 text-sm">Thông báo gần đây</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:text-indigo-800 transition-colors">
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markAsRead(n.id);
                            if (n.actionUrl) {
                              setIsNotificationOpen(false);
                              navigate(n.actionUrl);
                            }
                          }}
                          className={`p-5 border-b border-slate-50 cursor-pointer transition-all ${!n.read ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex gap-4">
                            <div className="shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
                            <div className="flex-1">
                              <p className={`text-xs leading-relaxed ${!n.read ? 'font-black text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{n.message}</p>
                              <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Clock size={10} /> {formatTime(n.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 px-6 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                          <Bell size={24} />
                        </div>
                        <p className="text-slate-400 text-xs font-bold">Không có thông báo mới</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleViewAll}
                    className="w-full py-4 text-[11px] font-black text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-[0.2em] border-t border-slate-50 bg-white"
                  >
                    Xem tất cả thông báo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-4 cursor-pointer group bg-slate-50/80 hover:bg-indigo-50/50 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-10 h-10 rounded-xl border-2 border-white shadow-sm overflow-hidden relative shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white bg-indigo-600 uppercase shadow-inner">
                    {user?.fullName?.[0] || user?.username?.[0] || "U"}
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>

              <div className="text-left hidden lg:block">
                <p className="text-xs font-black text-slate-800 leading-none truncate max-w-[120px]">{user?.fullName || user?.username}</p>
                <p className="text-[10px] font-extrabold text-indigo-500 uppercase mt-1 tracking-wider">{getPrimaryRole()}</p>
              </div>

              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-indigo-500' : 'group-hover:text-slate-600'}`} />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 overflow-hidden origin-top-right"
                >
                  <div className="px-4 py-3 mb-2 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tài khoản cá nhân</p>
                    <p className="text-xs font-black text-slate-800 truncate">{user?.email || "Chưa cập nhật email"}</p>
                  </div>

                  <button
                    onClick={() => {
                      const rolePrefix = user?.role?.toLowerCase() === 'super_admin' || user?.role?.toLowerCase() === 'admin' ? 'admin' : 'lecturer';
                      navigate(`/${rolePrefix}/profile`);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                      <User size={16} />
                    </div>
                    Hồ sơ cá nhân
                  </button>

                  {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                    <button
                      onClick={() => { navigate("/admin/settings"); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3.5 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Settings size={16} />
                      </div>
                      Cấu hình hệ thống
                    </button>
                  )}

                  <div className="h-px bg-slate-50 my-2 mx-3" />

                  <button
                    onClick={handleLogoutAction}
                    className="w-full px-4 py-3 text-left text-xs font-black text-rose-500 hover:bg-rose-50 flex items-center gap-3.5 transition-all uppercase tracking-[0.2em]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-500">
                      <LogOut size={16} />
                    </div>
                    Đăng xuất
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;