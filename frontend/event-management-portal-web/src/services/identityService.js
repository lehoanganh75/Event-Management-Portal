// src/services/identityService.js
import axiosClient from '../api/axiosClient';

const identityService = {
    // ==================== AUTH ====================
    register: (data) => 
        axiosClient.post('/identity/auth/register', data),

    login: (data) => 
        axiosClient.post('/identity/auth/login', data),

    logout: (refreshToken) => 
        axiosClient.post('/identity/auth/logout', null, {
            params: { refreshToken }
        }),

    forgotPassword: (email) => 
        axiosClient.post('/identity/auth/forgot-password', null, {
            params: { email }
        }),

    resetPassword: (token, newPassword) => 
        axiosClient.post('/identity/auth/reset-password', null, {
            params: { token, newPassword }
        }),

    verifyEmail: (token) => 
        axiosClient.get('/identity/auth/verify', {
            params: { token }
        }),

    // ==================== USER PROFILE ====================
    getMyProfile: () => 
        axiosClient.get('/identity/profiles/me'),

    updateMyProfile: (updatedData) => 
        axiosClient.put('/identity/profiles/me', updatedData),

    // ==================== ADMIN ====================
    getAllAccounts: () => 
        axiosClient.get('/identity/accounts'),

    getAccountById: (id) => 
        axiosClient.get(`/identity/accounts/${id}`),

    updateAccount: (id, data) => 
        axiosClient.put(`/identity/accounts/${id}`, data),

    updateAccountStatus: (id, status) => 
        axiosClient.put(`/identity/accounts/${id}/status`, { status }),

    updateAccountRoles: (id, role) => 
        axiosClient.put(`/identity/accounts/${id}/roles`, role, {
            headers: { 'Content-Type': 'text/plain' } // Xác định rõ loại nội dung nếu gửi chuỗi thuần
        }),

    deleteAccount: (id) => 
        axiosClient.delete(`/identity/accounts/${id}`),

    // ==================== SEARCH & BATCH ====================
    searchUsers: (keyword) => 
        axiosClient.get('/identity/profiles/search', {
            params: { keyword }
        }),

    getUsersByIds: (ids) => 
        axiosClient.get('/identity/profiles/batch', {
            params: { ids }, // Axios sẽ tự render: ?ids=1&ids=2...
            paramsSerializer: { indexes: null } 
        }),

    getUserById: (id) => 
        axiosClient.get('/identity/profiles/invite', {
            params: { id }
        }),
};

export default identityService;