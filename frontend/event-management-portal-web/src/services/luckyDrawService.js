import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/lucky-draw';
const IDENTITY_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/identity';


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

const luckyDrawService = {
    // ==================== CAMPAIGNS ====================
    getAll: () => privateApi.get('/lucky-draws'),

    getById: (id) => privateApi.get(`/lucky-draws/${id}`),

    create: (data) => privateApi.post('/lucky-draws', data),

    update: (id, data) => privateApi.put(`/lucky-draws/${id}`, data),

    delete: (id) => privateApi.delete(`/lucky-draws/${id}`),

    // ==================== RESULTS ====================
    getAllResults: () => privateApi.get('/results'),

    getResultsByCampaign: (drawId) => privateApi.get(`/results/lucky-draw/${drawId}`),

    // ==================== ACTIONS ====================
    spin: (luckyDrawId) => privateApi.post(`/lucky-draws/${luckyDrawId}/spin`),
    adminSpin: (luckyDrawId, prizeId) => {
        const url = prizeId ? `/lucky-draws/${luckyDrawId}/admin-spin?prizeId=${prizeId}` : `/lucky-draws/${luckyDrawId}/admin-spin`;
        return privateApi.post(url);
    },

    // ==================== ENTRIES ====================
    getEntry: (luckyDrawId) => privateApi.get(`/lucky-draws/draw-entry/${luckyDrawId}`),
    getParticipants: (luckyDrawId) => privateApi.get(`/lucky-draws/${luckyDrawId}/participants`),

    joinDraw: (luckyDrawId) => privateApi.post(`/lucky-draws/${luckyDrawId}`),

    updateClaimed: (resultId, claimed) => privateApi.put(`/lucky-draws/results/${resultId}/claimed?claimed=${claimed}`),

    findLuckyDrawByEventId: (eventId) => privateApi.get(`/lucky-draws/events/${eventId}`)
};

export default luckyDrawService;