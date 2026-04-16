import axios from 'axios';

const IDENTITY_URL = 'http://localhost:8083';

// --- INSTANCE 1: DÀNH CHO PUBLIC (Auth) ---
const publicIdentity = axios.create({
    baseURL: IDENTITY_URL,
    headers: { 'Content-Type': 'application/json' },
});

// --- INSTANCE 2: DÀNH CHO PRIVATE (Profiles & Admin) ---
const privateIdentity = axios.create({
    baseURL: IDENTITY_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Gắn token cho privateIdentity
privateIdentity.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Tự động Refresh Token cho privateIdentity
privateIdentity.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // Gọi API refresh dùng instance PUBLIC để tránh loop
                const res = await publicIdentity.post('/auth/refresh', { refreshToken });
                localStorage.setItem('accessToken', res.data.accessToken);
                
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return privateIdentity(originalRequest);
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    register: (data) => publicIdentity.post('/auth/register', data),
    login: (data) => publicIdentity.post('/auth/login', data),
    logout: (refreshToken) => publicIdentity.post('/auth/logout', null, { params: { refreshToken } }),
    verifyOtp: (username, otp) => publicIdentity.post("/auth/verify-otp", {
        username,
        otp
    }),
    forgotPassword: (email) => publicIdentity.post('/auth/forgot-password', null, { params: { email } }),
    resetPassword: (token, newPassword) => publicIdentity.post('/auth/reset-password', null, { params: { token, newPassword } }),
    

    getMyProfile: () => privateIdentity.get('/profiles/me'),
    updateMyProfile: (updatedData) => privateIdentity.put('/profiles/me', updatedData),

    getAllAccounts: () => privateIdentity.get('/accounts'),
    getAccountById: (id) => privateIdentity.get(`/accounts/${id}`),
    updateAccount: (id, data) => privateIdentity.put(`/accounts/${id}`, data),
    updateAccountStatus: (id, status) => privateIdentity.put(`/accounts/${id}/status`, { status }),
    updateAccountRoles: (id, role) => privateIdentity.put(`/accounts/${id}/roles`, role, {
        headers: { 'Content-Type': 'text/plain' }
    }),
    deleteAccount: (id) => privateIdentity.delete(`/accounts/${id}`),

    searchUsers: (keyword) => privateIdentity.get('/profiles/search', { params: { keyword } }),
    getUsersByIds: (ids) => privateIdentity.get('/profiles/batch', {
        params: { ids },
        paramsSerializer: { indexes: null } 
    }),
    getUserById: (id) => privateIdentity.get('/profiles/invite', { params: { id } }),
};

export default authService;