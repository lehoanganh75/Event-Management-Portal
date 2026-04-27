import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, CheckCircle, Calendar, Clock, X, Check, Info, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { showToast } from "../../utils/toast.jsx";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên Cao Cấp",
  ADMIN: "Quản Trị Viên",
  LECTURER: "Giảng Viên / Tổ Chức",
  STUDENT: "Sinh Viên",
};

const HeaderAdmin = () => {
  const navigate = useNavigate();

  // 1. LẤY DỮ LIỆU VÀ HÀM TỪ AUTH CONTEXT
  const { user, logout, isAuthenticated } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const notificationRef = useRef(null);
  const menuRef = useRef(null);

  // 2. FETCH THÔNG BÁO DỰA TRÊN USER TỪ CONTEXT
  const fetchNoti = async () => {
    try {
      const [unreadRes, recentRes] = await Promise.all([
        notificationService.getUnreadCount(user.id),
        notificationService.getRecentNotifications(user.id, 5)
      ]);
      setUnreadCount(unreadRes.data);
      setNotifications(recentRes.data || []);
    } catch (error) {
      console.error("Lỗi fetch thông báo:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNoti();

      const stompClient = new Client({
        brokerURL: "ws://localhost:8085/ws",
        webSocketFactory: () => new SockJS("http://localhost:8085/ws"),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("✅ [ADMIN WS] Connected for User ID:", user.id);
          stompClient.subscribe(`/topic/notifications.${user.id}`, (message) => {
            if (message.body) {
              const newNotification = JSON.parse(message.body);
              console.log("📩 [ADMIN WS] Received notification:", newNotification);

              setNotifications(prev => [newNotification, ...prev].slice(0, 10));
              setUnreadCount(prev => prev + 1);

              showToast(
                <div className="flex flex-col gap-0.5 text-left">
                  <p className="font-bold text-[13px] uppercase tracking-tight">{newNotification.title}</p>
                  <p className="text-[11px] opacity-80 line-clamp-2">{newNotification.message}</p>
                </div>,
                'info'
              );
            }
          });
        },
        onStompError: (frame) => {
          console.error("❌ [ADMIN WS] STOMP Error:", frame.headers['message']);
        },
        onWebSocketError: (event) => {
          console.error("❌ [ADMIN WS] WebSocket Error:", event);
        },
        onDisconnect: () => {
          console.log("🔌 [ADMIN WS] Disconnected");
        }
      });

      stompClient.activate();
      return () => stompClient.deactivate();
    }
  }, [isAuthenticated, user?.id]);

  // Click outside listener
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

  // 3. XỬ LÝ ĐĂNG XUẤT QUA CONTEXT
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

  // Logic đánh dấu đã đọc
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
    } catch (error) { console.error(error); }
    finally { setIsMarkingAll(false); }
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      navigate("/admin/notifications");
    } else {
      navigate("/lecturer/notifications");
    }
  };

  // UI Helpers
  const getPrimaryRole = () => roleMap[user?.role] || "Quản trị viên";

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
      'PLAN_CREATED': <Calendar size={18} className="text-emerald-500" />,
      'PLAN_SUBMITTED': <Bell size={18} className="text-blue-500" />,
      'PLAN_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'PLAN_REJECTED': <XCircle size={18} className="text-red-500" />,
      'EVENT_SUBMITTED': <Bell size={18} className="text-orange-500" />,
      'EVENT_CREATED': <Calendar size={18} className="text-purple-500" />,
      'EVENT_APPROVED': <CheckCircle size={18} className="text-green-500" />,
      'EVENT_REJECTED': <XCircle size={18} className="text-red-500" />,
      'REGISTRATION_CONFIRMED': <CheckCircle size={18} className="text-blue-500" />,
      'SYSTEM': <Info size={18} className="text-purple-500" />,
    };
    return icons[type] || <Bell size={18} className="text-slate-400" />;
  };

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div onClick={() => navigate("/admin")} className="cursor-pointer">
            <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Admin Management</h1>
            <p className="text-[10px] font-bold text-slate-400 italic leading-none">Industrial University of Ho Chi Minh City</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllAsRead} disabled={isMarkingAll} className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                        {isMarkingAll ? "Đang xử lý..." : "Đánh dấu đã đọc"}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && handleMarkAsRead(n.id)}
                          className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex gap-3">
                            {getNotificationIcon(n.type)}
                            <div className="flex-1">
                              <p className={`text-xs ${!n.read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-medium">{formatTime(n.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-400 text-xs font-medium">Không có thông báo mới</div>
                    )}
                  </div>
                  <button onClick={handleViewAll} className="w-full py-3 text-[11px] font-bold text-slate-500 hover:text-blue-600 bg-slate-50/50 transition-colors uppercase tracking-widest">
                    Xem tất cả
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-800 leading-none">{user?.fullName || user?.username}</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase mt-1 tracking-tighter">{getPrimaryRole()}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-white shadow-sm overflow-hidden relative">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white bg-linear-to-br from-blue-600 to-indigo-600 uppercase shadow-inner">
                    {user?.fullName?.[0] || user?.username?.[0] || "U"}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                >
                  <button onClick={() => { navigate("/admin/profile"); setIsDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <User size={16} className="text-slate-400" /> Hồ sơ Admin
                  </button>
                  <button onClick={() => { navigate("/admin/settings"); setIsDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Settings size={16} className="text-slate-400" /> Cấu hình hệ thống
                  </button>
                  <div className="h-px bg-slate-50 my-1 mx-2" />
                  <button onClick={handleLogoutAction} className="w-full px-4 py-2.5 text-left text-xs font-black text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors uppercase tracking-widest">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Logout Toast removed in favor of global showToast */}
    </>
  );
};

export default HeaderAdmin;