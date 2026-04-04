import axiosClient from '../api/axiosClient';

const luckyDrawService = {
    // ==================== LUCKY DRAW (MAIN) ====================
    
    // Lấy tất cả danh sách chương trình may mắn
    getAll: () => axiosClient.get('/lucky-draw/lucky-draws'),

    // Lấy chi tiết 1 chương trình
    getById: (id) => axiosClient.get(`/lucky-draw/lucky-draws/${id}`),

    // Tạo mới chương trình (Dành cho BTC)
    create: (data) => axiosClient.post('/lucky-draw/lucky-draws', data),

    // Cập nhật chương trình
    update: (id, data) => axiosClient.put(`/lucky-draw/lucky-draws/${id}`, data),

    // THỰC HIỆN QUAY THƯỞNG (Spin)
    spin: (luckyDrawId) => axiosClient.post(`/lucky-draw/lucky-draws/${luckyDrawId}/spin`),

    // ==================== DRAW ENTRIES ====================

    // Kiểm tra lượt tham gia của user hiện tại cho 1 chương trình
    getEntry: (luckyDrawId) => axiosClient.get(`/lucky-draw/draw-entries/${luckyDrawId}`),

    // Đăng ký tham gia chương trình (để có tên trong danh sách quay)
    joinDraw: (luckyDrawId) => axiosClient.post(`/lucky-draw/draw-entries/${luckyDrawId}`)
};

export default luckyDrawService;