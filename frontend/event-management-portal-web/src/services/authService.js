import axios from 'axios';

const BASE_URL = 'http://localhost:8083';

// 1. PUBLIC API (No Token)
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// 2. PRIVATE API (With Token + Refresh Logic)
const privateApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Request Interceptor: Attach Access Token
privateApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token
privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error("No refresh token");

                // Refresh call (Always to Identity Service)
                const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
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

const authService = {
    // --- AUTH (Public) ---
    register: (data) => publicApi.post('/auth/register', data),
    checkEmail: (email) => publicApi.get('/auth/check-email', { params: { email } }),
    checkUsername: (username) => publicApi.get('/auth/check-username', { params: { username } }),
    login: (credentials) => publicApi.post('/auth/login', credentials),
    logout: (refreshToken) => privateApi.post('/auth/logout', { refreshToken }),
    verifyOtp: (username, otp) => publicApi.post('/auth/verify-otp', { username, otp }),
    resendOtp: (username) => publicApi.post('/auth/resend-otp', null, { params: { username } }),
    forgotPassword: (email) => publicApi.post('/auth/forgot-password', null, { params: { email } }),
    resetPassword: (token, newPassword) => publicApi.post('/auth/reset-password', null, { params: { token, newPassword } }),
    changePassword: (passwordData) => privateApi.patch('/auth/change-password', passwordData),

    // --- PROFILES (Private) ---
    getMyProfile: (options = {}) => privateApi.get('/profiles/me', options),
    updateMyProfile: (updatedData) => privateApi.put('/profiles/me', updatedData),
    searchUsers: (keyword) => privateApi.get('/profiles/search', { params: { keyword } }),
    getUsersByIds: (ids) => privateApi.get('/profiles/batch', {
        params: { ids },
        paramsSerializer: { indexes: null }
    }),
    getUserById: (id) => privateApi.get('/profiles/invite', { params: { id } }),

    // --- ACCOUNTS (Admin) ---
    getAllAccounts: () => privateApi.get('/accounts'),
    getAccountById: (id) => privateApi.get(`/accounts/${id}`),
    updateAccount: (id, data) => privateApi.put(`/accounts/${id}`, data),
    updateAccountStatus: (id, status) => privateApi.put(`/accounts/${id}/status`, { status }),
    updateAccountRoles: (id, role) => privateApi.put(`/accounts/${id}/roles`, role, {
        headers: { 'Content-Type': 'text/plain' }
    }),
    deleteAccount: (id) => privateApi.delete(`/accounts/${id}`),
};

export default authService;
