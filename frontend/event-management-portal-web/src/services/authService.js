import axiosClient from '../api/axiosClient';

const authService = {
    // --- GROUP 1: AUTH (Public) ---
    register: (data) => axiosClient.post('/identity/auth/register', data),
    checkEmail: (email) => axiosClient.get('/identity/auth/check-email', { params: { email } }),
    checkUsername: (username) => axiosClient.get('/identity/auth/check-username', { params: { username } }),
    login: (data) => axiosClient.post('/identity/auth/login', data),
    logout: (refreshToken) => axiosClient.post('/identity/auth/logout', null, { params: { refreshToken } }),
    verifyOtp: (username, otp) => axiosClient.post("/identity/auth/verify-otp", { username, otp }),
    resendOtp: (username) => axiosClient.post("/identity/auth/resend-otp", null, { params: { username } }),
    forgotPassword: (email) => axiosClient.post('/identity/auth/forgot-password', null, { params: { email } }),
    resetPassword: (token, newPassword) => axiosClient.post('/identity/auth/reset-password', null, { params: { token, newPassword } }),
    
    // --- GROUP 2: PROFILES ---
    getMyProfile: (options = {}) => axiosClient.get('/identity/profiles/me', options),
    updateMyProfile: (updatedData) => axiosClient.put('/identity/profiles/me', updatedData),
    searchUsers: (keyword) => axiosClient.get('/identity/profiles/search', { params: { keyword } }),
    getUsersByIds: (ids) => axiosClient.get('/identity/profiles/batch', {
        params: { ids },
        paramsSerializer: { indexes: null } 
    }),
    getUserById: (id) => axiosClient.get('/identity/profiles/invite', { params: { id } }),

    // --- GROUP 3: ACCOUNTS (Admin) ---
    getAllAccounts: () => axiosClient.get('/identity/accounts'),
    getAccountById: (id) => axiosClient.get(`/identity/accounts/${id}`),
    updateAccount: (id, data) => axiosClient.put(`/identity/accounts/${id}`, data),
    updateAccountStatus: (id, status) => axiosClient.put(`/identity/accounts/${id}/status`, { status }),
    updateAccountRoles: (id, role) => axiosClient.put(`/identity/accounts/${id}/roles`, role, {
        headers: { 'Content-Type': 'text/plain' }
    }),
    deleteAccount: (id) => axiosClient.delete(`/identity/accounts/${id}`),
};

export default authService;