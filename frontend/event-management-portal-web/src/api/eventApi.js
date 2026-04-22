import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

// Hàm helper để chuẩn hóa dữ liệu ngày tháng và ảnh
const transformBaseData = (data) => {
  if (!data) return null;
  const start = data.startTime ? new Date(data.startTime) : null;
  const end = data.endTime ? new Date(data.endTime) : null;
  
  return {
    ...data,
    imageUrl: data.coverImage,
    // Format ngày theo chuẩn VN để hiển thị luôn
    eventDate: start ? start.toLocaleDateString("vi-VN") : "",
    eventTime: start && end 
        ? `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
        : "",
    startTime: start,
    endTime: end,
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
    createdAt: data.createdAt ? new Date(data.createdAt) : null,
  };
};

export const eventApi = {
  // --- NHÓM SỰ KIỆN (EVENTS) ---
  events: {
    // Tự động xử lý cả Page object (Spring Data) và Array
    getAll: (params = {}) => axiosClient.get(API_ENDPOINTS.EVENTS.BASE, { params })
        .then(res => ({ 
            ...res, 
            data: (Array.isArray(res.data) ? res.data : res.data?.content || []).map(transformBaseData) 
        })),

    getMyEvents: () => axiosClient.get(`${API_ENDPOINTS.EVENTS.BASE}/my-events`)
        .then(res => ({ 
            ...res, 
            data: (Array.isArray(res.data) ? res.data : res.data?.content || []).map(transformBaseData) 
        })),
    
    getById: (id) => axiosClient.get(`${API_ENDPOINTS.EVENTS.BASE}/${id}`)
        .then(res => ({ ...res, data: transformBaseData(res.data) })),
        
    getByStatus: (status) => axiosClient.get(`${API_ENDPOINTS.EVENTS.BASE}/by-statuses`, { params: { statuses: status.toUpperCase() } })
        .then(res => ({ ...res, data: (res.data || []).map(transformBaseData) })),

    update: (id, data) => axiosClient.put(`${API_ENDPOINTS.EVENTS.BASE}/${id}`, data),
    
    delete: (id) => axiosClient.delete(`${API_ENDPOINTS.EVENTS.BASE}/${id}`),

    cancel: (id, reason) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.BASE}/${id}/cancel`, null, { params: { reason } }),

    submitApproval: (id) => axiosClient.post(`${API_ENDPOINTS.EVENTS.BASE}/plans/${id}/submit`), // Theo backend hiện tại

    create: (data) => axiosClient.post(API_ENDPOINTS.EVENTS.BASE, data),
    getAdminAll: () => axiosClient.get(`${API_ENDPOINTS.EVENTS.BASE}/admin/all`)
        .then(res => ({ 
            ...res, 
            data: (Array.isArray(res.data) ? res.data : res.data?.content || []).map(transformBaseData) 
        })),
  },

  // --- NHÓM KẾ HOẠCH (PLANS) ---
  plans: {
    getAll: (params = {}) => axiosClient.get(API_ENDPOINTS.EVENTS.PLANS, { params }),

    getMyPlans: () => axiosClient.get(`${API_ENDPOINTS.EVENTS.PLANS}/my`)
        .then(res => ({ ...res, data: (res.data || []).map(transformBaseData) })),

    getById: (id) => axiosClient.get(`${API_ENDPOINTS.EVENTS.PLANS}/${id}`)
        .then(res => ({ ...res, data: transformBaseData(res.data) })),

    create: (data, submit = false) => axiosClient.post(`${API_ENDPOINTS.EVENTS.PLANS}?submit=${submit}`, data),

    update: (id, data) => axiosClient.put(`${API_ENDPOINTS.EVENTS.PLANS}/${id}`, data),

    submit: (id) => axiosClient.post(`${API_ENDPOINTS.EVENTS.PLANS}/${id}/submit`),

    createEvent: (id, eventDetails = {}) => axiosClient.post(`${API_ENDPOINTS.EVENTS.PLANS}/${id}/create-event`, eventDetails),

    delete: (id) => axiosClient.delete(`${API_ENDPOINTS.EVENTS.PLANS}/${id}`),
  },

  // --- NHÓM ĐĂNG KÝ (REGISTRATIONS) ---
  registrations: {
    // Sử dụng đúng function từ config
    check: (eventId) => axiosClient.get(API_ENDPOINTS.EVENTS.REGISTRATIONS.CHECK(eventId)),    
    
    register: (eventId) => axiosClient.post(API_ENDPOINTS.EVENTS.REGISTRATIONS.REGISTER(eventId)),
    
    getQR: (registrationId) => axiosClient.get(API_ENDPOINTS.EVENTS.REGISTRATIONS.GET_QR(registrationId)),

    cancel: (eventId) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.REGISTRATIONS.CANCEL}/${eventId}`),
    
    // Lấy danh sách người tham gia của 1 sự kiện
    getUsersByEvent: (eventId) => axiosClient.get(`${API_ENDPOINTS.EVENTS.REGISTRATIONS.BASE}/event/${eventId}`),
  },

  // --- QUẢN TRỊ (ADMIN) ---
  admin: {
    approvePlan: (id) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.ADMIN}/plans/${id}/approve`),
    rejectPlan: (id, reason) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.ADMIN}/plans/${id}/reject`, null, { params: { reason } }),
  },

  // --- CÁC DỊCH VỤ KHÁC ---
  luckyDraw: {
    createEntry: (drawId) => axiosClient.post(API_ENDPOINTS.LUCKY_DRAW.ENTRIES(drawId)),
  }
};