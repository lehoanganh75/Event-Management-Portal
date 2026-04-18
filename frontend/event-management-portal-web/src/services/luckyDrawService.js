import axios from 'axios';

const LUCKY_DRAW_URL = 'http://localhost:8084';

const publicLUCKY_DRAW = axios.create({
    baseURL: LUCKY_DRAW_URL,
    headers: { 'Content-Type': 'application/json' },
});

const privateLUCKY_DRAW = axios.create({
    baseURL: LUCKY_DRAW_URL,
    headers: { 'Content-Type': 'application/json' },
});

privateLUCKY_DRAW.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Tự động Refresh Token cho privateLUCKY_DRAW
privateLUCKY_DRAW.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // Gọi API refresh dùng instance PUBLIC để tránh loop
                const res = await publicLUCKY_DRAW.post('/auth/refresh', { refreshToken });
                localStorage.setItem('accessToken', res.data.accessToken);
                
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return privateLUCKY_DRAW(originalRequest);
            } catch (_err) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const luckyDrawService = {
    // ==================== LUCKY DRAW (MAIN) ====================
    
    // Lấy tất cả danh sách chương trình may mắn
    getAll: () => privateLUCKY_DRAW.get('/lucky-draws'),

    // Lấy chi tiết 1 chương trình
    getById: (id) => privateLUCKY_DRAW.get(`/lucky-draws/${id}`),

    // Tạo mới chương trình (Dành cho BTC)
    create: (data) => privateLUCKY_DRAW.post('/lucky-draws', data),

    // Cập nhật chương trình
    update: (id, data) => privateLUCKY_DRAW.put(`/lucky-draws/${id}`, data),

    // THỰC HIỆN QUAY THƯỞNG (Spin)
    spin: (luckyDrawId) => privateLUCKY_DRAW.post(`/lucky-draws/${luckyDrawId}/spin`),

    // ==================== DRAW ENTRIES ====================

    // Kiểm tra lượt tham gia của user hiện tại cho 1 chương trình
    getEntry: (luckyDrawId) => privateLUCKY_DRAW.get(`/lucky-draws/draw-entries/${luckyDrawId}`),

    // Đăng ký tham gia chương trình (để có tên trong danh sách quay)
    joinDraw: (luckyDrawId) => privateLUCKY_DRAW.post(`/lucky-draws/draw-entries/${luckyDrawId}`),

    findLuckyDrawByEventId: (eventId) => privateLUCKY_DRAW.get(`/lucky-draws/events/${eventId}`)
};

export default luckyDrawService;