import axiosClient from '../api/axiosClient';

const notificationService = {
    // ==================== FETCH DATA ====================
    // Lấy thông báo gần đây cho Header/Popup
    getRecent: (userId, limit = 10) => 
        axiosClient.get(`/notification/notifications/user/${userId}/recent`, { params: { limit } }),

    // Lấy thông báo phân trang cho trang danh sách
    getPaged: (userId, page = 0, size = 20) => 
        axiosClient.get(`/notification/notifications/user/${userId}/paged`, { params: { page, size } }),

    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: (userId) => 
        axiosClient.get(`/notification/notifications/user/${userId}/unread-count`),

    // Lấy danh sách chưa đọc
    getUnreadList: (userId) => 
        axiosClient.get(`/notification/notifications/user/${userId}/unread`),

    // Thống kê thông báo
    getStats: (userId) => 
        axiosClient.get(`/notification/notifications/user/${userId}/stats`),

    // ==================== ACTIONS ====================
    // Đánh dấu 1 thông báo đã đọc
    markAsRead: (id) => 
        axiosClient.patch(`/notification/notifications/${id}/read`),

    // Đánh dấu tất cả là đã đọc
    markAllRead: (userId) => 
        axiosClient.patch(`/notification/notifications/user/${userId}/read-all`),

    // Đánh dấu nhiều thông báo theo lô (batch)
    markBatchRead: (ids) => 
        axiosClient.patch(`/notification/notifications/read-batch`, ids),

    // ==================== DELETE ====================
    deleteNotification: (id) => 
        axiosClient.delete(`/notification/notifications/${id}`),

    deleteAll: (userId) => 
        axiosClient.delete(`/notification/notifications/user/${userId}`),
};

export default notificationService;