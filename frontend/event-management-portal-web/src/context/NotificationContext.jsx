import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
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
        refreshNotifications();
        
        // (Tùy chọn) Có thể thiết lập interval để poll thông báo mới mỗi 1 phút
        // const interval = setInterval(refreshNotifications, 60000);
        // return () => clearInterval(interval);
    }, [refreshNotifications]);

    // Hành động: Đánh dấu đã đọc
    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Cập nhật UI local ngay lập tức
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
        service: notificationService // Expose service để dùng các hàm nâng cao (phân trang, export)
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};