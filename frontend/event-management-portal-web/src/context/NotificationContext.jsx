import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { showToast } from "../utils/toast.jsx";

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Lấy số lượng chưa đọc & 10 cái gần nhất
    const refreshNotifications = useCallback(async () => {
        const userId = user?.id || user?.accountId;
        if (!userId) return;

        try {
            setLoading(true);
            const [recentRes, countRes] = await Promise.all([
                notificationService.getRecent(userId, 10),
                notificationService.getUnreadCount(userId)
            ]);
            
            setNotifications(recentRes.data || []);
            setUnreadCount(countRes.data || 0);
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Tự động tải lại thông báo khi user đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            refreshNotifications();
        }
    }, [refreshNotifications, isAuthenticated]);

    // Setup Realtime Listener
    useEffect(() => {
        const userId = user?.id || user?.accountId;
        if (isAuthenticated && userId) {
            const stompClient = new Client({
                brokerURL: "ws://localhost:8085/ws",
                webSocketFactory: () => new SockJS("http://localhost:8085/ws"),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log("✅ [Global WS] Connected for User ID:", userId);
                    stompClient.subscribe(`/topic/notifications.${userId}`, (message) => {
                        if (message.body) {
                            const newNotification = JSON.parse(message.body);
                            console.log("📩 [Global WS] Received notification:", newNotification);

                            setNotifications(prev => [newNotification, ...prev].slice(0, 15));
                            setUnreadCount(prev => prev + 1);

                            // Nếu tài khoản bị khóa -> Ép đăng xuất ngay lập tức
                            if (newNotification.type === 'ACCOUNT_LOCKED') {
                                showToast(
                                    <div className="flex flex-col gap-0.5 text-left">
                                        <p className="font-black text-rose-600 uppercase tracking-tight">Tài khoản đã bị khóa</p>
                                        <p className="text-[11px] font-medium text-slate-600">Bạn sẽ bị đăng xuất ngay lập tức.</p>
                                    </div>,
                                    'error'
                                );
                                
                                // Đợi 2s để user kịp nhìn thấy thông báo rồi logout
                                setTimeout(() => {
                                    localStorage.clear();
                                    window.location.href = '/login?reason=locked';
                                }, 2000);
                                return;
                            }

                            // Hiển thị toast thông báo bình thường
                            showToast(
                                <div className="flex flex-col gap-0.5 text-left">
                                    <p className="font-bold text-[13px] uppercase tracking-tight">{newNotification.title}</p>
                                    <p className="text-[11px] opacity-80 line-clamp-2">{newNotification.message}</p>
                                </div>,
                                'info'
                            );
                        }
                    });
                }
            });

            stompClient.activate();
            return () => stompClient.deactivate();
        }
    }, [isAuthenticated, user]);

    // Hành động: Xóa thông báo
    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setUnreadCount(prev => {
                const deleted = notifications.find(n => n.id === notificationId);
                return (deleted && !deleted.read) ? Math.max(0, prev - 1) : prev;
            });
        } catch (error) {
            console.error("Lỗi khi xóa thông báo:", error);
            throw error;
        }
    };

    // Hành động: Đánh dấu đã đọc
    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
    };

    // Hành động: Đọc tất cả
    const markAllAsRead = async () => {
        const userId = user?.id || user?.accountId;
        if (!userId) return;
        try {
            await notificationService.markAllRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Lỗi khi đánh dấu đọc tất cả:", error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        service: notificationService
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};