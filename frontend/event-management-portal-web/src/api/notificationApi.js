import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

export const notificationApi = {
    // 1. NHÓM LẤY DỮ LIỆU (GET)
    get: {
        // Cho Admin: Lấy tất cả thông báo hệ thống
        allForAdmin: () => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/admin/all`),

        // Cho User: Lấy thông báo theo ID người dùng
        byUser: (userId) => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}`),

        // Lấy phân trang
        paged: (userId, page = 0, size = 20) => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}/paged`, {
                params: { page, size }
            }),

        unreadCount: (userId) => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}/unread-count`),

        byId: (id) => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`),
        
        recent: (userId, limit = 5) => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}/recent`, {
                params: { limit }
            }),
            
        stats: (userId) => 
            axiosClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}/stats`),
    },

    // 2. NHÓM HÀNH ĐỘNG/CẬP NHẬT (PATCH)
    actions: {
        markAsRead: (id) => 
            axiosClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`),

        markBatchRead: (ids) => 
            axiosClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/read-batch`, ids),

        markAllRead: (userId) => 
            // Nếu admin gọi thì không cần userId, nếu user gọi thì cần theo endpoint backend
            axiosClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}/read-all`),
            
        markAllReadAdmin: () => 
            axiosClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`),
    },

    // 3. NHÓM TẠO MỚI (POST)
    create: {
        // Gửi thông báo (Admin dùng để broadcast hoặc gửi cụ thể)
        send: (payload) => {
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
            );
            return axiosClient.post(`${API_ENDPOINTS.NOTIFICATIONS}`, cleanPayload);
        },

        bulk: (request) => 
            axiosClient.post(`${API_ENDPOINTS.NOTIFICATIONS}/bulk`, request),
        
        realtime: (request) => 
            axiosClient.post(`${API_ENDPOINTS.NOTIFICATIONS}/realtime`, request),
    },

    // 4. NHÓM XÓA (DELETE)
    delete: {
        byId: (id) => 
            axiosClient.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`),

        batch: (ids) => 
            axiosClient.delete(`${API_ENDPOINTS.NOTIFICATIONS}/batch`, { data: ids }),

        allByUser: (userId) => 
            axiosClient.delete(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}`),
        
        cleanup: (daysToKeep = 30) => 
            axiosClient.delete(`${API_ENDPOINTS.NOTIFICATIONS}/cleanup`, {
                params: { daysToKeep }
            }),
    }
};

export default notificationApi;