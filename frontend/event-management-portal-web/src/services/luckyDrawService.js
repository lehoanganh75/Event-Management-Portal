import axios from 'axios';

const LUCKY_DRAW_URL = 'http://localhost:8084';

const privateluckydraw = axios.create({
    baseURL: LUCKY_DRAW_URL,
    headers: { 'LUCKY_DRAW_URL-Type': 'application/json' },
});


privateluckydraw.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Tự động Refresh Token cho privateLUCKY_DRAW
privateluckydraw.interceptors.response.use(
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
            } catch (err) {
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
    getAll: () => privateluckydraw.get('/lucky-draws'),

    // Lấy chi tiết 1 chương trình
    getById: (id) => privateluckydraw.get(`/lucky-draws/${id}`),

    // Tạo mới chương trình (Dành cho BTC)
    create: (data) => privateluckydraw.post('/lucky-draws', data),

    // Cập nhật chương trình
    update: (id, data) => privateluckydraw.put(`/lucky-draws/${id}`, data),

    // THỰC HIỆN QUAY THƯỞNG (Spin)
    spin: (luckyDrawId) => privateluckydraw.post(`/lucky-draws/${luckyDrawId}/spin`),

    // ==================== DRAW ENTRIES ====================

    // Kiểm tra lượt tham gia của user hiện tại cho 1 chương trình
    getEntry: (luckyDrawId) => privateluckydraw.get(`/lucky-draws/draw-entries/${luckyDrawId}`),

    // Đăng ký tham gia chương trình (để có tên trong danh sách quay)
    joinDraw: (luckyDrawId) => privateluckydraw.post(`/lucky-draws/draw-entries/${luckyDrawId}`),

    findLuckyDrawByEventId: (eventId) => privateluckydraw.get(`/lucky-draws/events/${eventId}`)
};

export default luckyDrawService;