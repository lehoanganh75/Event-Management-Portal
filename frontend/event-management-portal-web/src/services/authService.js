// src/services/authService.js
import axios from 'axios';

const AUTH_URL = 'http://localhost:8080';

const authClient = axios.create({
    baseURL: AUTH_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request interceptor
authClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Xử lý Refresh Token
authClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa từng thử lại (retry)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error("No refresh token");

                // Gọi API refresh dùng axios thuần để tránh interceptor lặp vô hạn
                const res = await axios.post(`${AUTH_URL}/identity/auth/refresh`, { refreshToken });

                const { accessToken, refreshToken: newRefreshToken } = res.data;

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                // Cập nhật lại header cho request cũ và thực hiện lại
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return authClient(originalRequest); // SỬA: Dùng authClient thay vì AUTHApi
            } catch (err) {
                // Nếu refresh thất bại -> Logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    register: (data) => authClient.post('/identity/auth/register', data),
    login: (data) => authClient.post('/identity/auth/login', data),
    logout: (refreshToken) => authClient.post('/identity/auth/logout', null, { params: { refreshToken } }),
    forgotPassword: (email) => authClient.post('/identity/auth/forgot-password', null, { params: { email } }),
    resetPassword: (token, newPassword) => authClient.post('/identity/auth/reset-password', null, { params: { token, newPassword } }),
    verifyEmail: (token) => authClient.get('/identity/auth/verify', { params: { token } }),

    getMyProfile: () => authClient.get('/identity/profiles/me'),
    updateMyProfile: (updatedData) => authClient.put('/identity/profiles/me', updatedData),

    getAllAccounts: () => authClient.get('/identity/accounts'),
    getAccountById: (id) => authClient.get(`/identity/accounts/${id}`),
    updateAccount: (id, data) => authClient.put(`/identity/accounts/${id}`, data),
    updateAccountStatus: (id, status) => authClient.put(`/identity/accounts/${id}/status`, { status }),
    updateAccountRoles: (id, role) => authClient.put(`/identity/accounts/${id}/roles`, role, {
        headers: { 'Content-Type': 'text/plain' }
    }),
    deleteAccount: (id) => authClient.delete(`/identity/accounts/${id}`),

    searchUsers: (keyword) => authClient.get('/identity/profiles/search', { params: { keyword } }),
    getUsersByIds: (ids) => authClient.get('/identity/profiles/batch', {
        params: { ids },
        paramsSerializer: { indexes: null } 
    }),
    getUserById: (id) => authClient.get('/identity/profiles/invite', { params: { id } }),
};

export default authService;