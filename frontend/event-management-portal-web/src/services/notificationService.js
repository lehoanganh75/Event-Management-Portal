import axios from 'axios';

const BASE_URL = 'http://localhost:8085/notifications';
const IDENTITY_BASE_URL = 'http://localhost:8083';

// 1. PUBLIC API
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// 2. PRIVATE API
const privateApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Request Interceptor
privateApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post(`${IDENTITY_BASE_URL}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = res.data;

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return privateApi(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (!originalRequest._silent) window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

const notificationService = {
    // Cho Admin: Lấy tất cả thông báo hệ thống
    getAllNotificationsForAdmin: () => privateApi.get('/admin/all'),

    // Cho User: Lấy thông báo theo ID người dùng
    getNotificationsByUser: (userId) => privateApi.get(`/user/${userId}`),

    // Lấy phân trang
    getPaged: (userId, page = 0, size = 20) =>
        privateApi.get(`/user/${userId}/paged`, { params: { page, size } }),

    getUnreadCount: (userId) => privateApi.get(`/user/${userId}/unread-count`),

    getById: (id) => privateApi.get(`/${id}`),

    getRecent: (userId, limit = 5) =>
        privateApi.get(`/user/${userId}/recent`, { params: { limit } }),

    getStats: (userId) => privateApi.get(`/user/${userId}/stats`),

    // ==================== ACTIONS ====================
    markAsRead: (id) => privateApi.patch(`/${id}/read`),

    markBatchRead: (ids) => privateApi.patch('/read-batch', ids),

    markAllRead: (userId) => privateApi.patch(`/user/${userId}/read-all`),

    markAllReadAdmin: () => privateApi.patch('/read-all'),

    // ==================== CREATE ====================
    sendNotification: (payload) => {
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
        );
        return privateApi.post('', cleanPayload);
    },

    sendBulk: (request) => privateApi.post('/bulk', request),

    sendRealtime: (request) => privateApi.post('/realtime', request),

    // ==================== DELETE ====================
    deleteNotification: (id) => privateApi.delete(`/${id}`),

    deleteBatchNotifications: (ids) => privateApi.delete('/batch', { data: ids }),

    deleteAllByUser: (userId) => privateApi.delete(`/user/${userId}`),

    cleanup: (daysToKeep = 30) =>
        privateApi.delete('/cleanup', { params: { daysToKeep } }),
    // Aliases for compatibility
    getRecentNotifications: (userId, limit) => notificationService.getRecent(userId, limit),
    deleteById: (id) => notificationService.deleteNotification(id),
    markAllAsRead: (userId) => notificationService.markAllRead(userId),
    markAllAsReadAdmin: () => notificationService.markAllReadAdmin(),
    createNotification: (payload) => notificationService.sendNotification(payload),
};

export default notificationService;