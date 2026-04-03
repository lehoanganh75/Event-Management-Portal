import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

const transformBaseData = (data) => {
  if (!data) return null;
  const start = data.startTime ? new Date(data.startTime) : null;
  const end = data.endTime ? new Date(data.endTime) : null;
  
  return {
    ...data,
    imageUrl: data.coverImage,
    eventDate: start ? start.toLocaleDateString("vi-VN") : "",
    eventTime: start && end 
        ? `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
        : "",
    startTime: start,
    endTime: end,
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
    createdAt: data.createdAt ? new Date(data.createdAt) : null,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
  };
};

export const eventApi = {
  // NHÓM SỰ KIỆN (EVENTS)
  events: {
    getAll: () => axiosClient.get(API_ENDPOINTS.EVENTS.BASE)
        .then(res => ({ ...res, data: (Array.isArray(res.data) ? res.data : res.data?.content || []).map(transformBaseData) })),
    
    getById: (id) => axiosClient.get(`${API_ENDPOINTS.EVENTS.BASE}/${id}`)
        .then(res => ({ ...res, data: transformBaseData(res.data) })),
        
    getByStatus: (status) => axiosClient.get(API_ENDPOINTS.EVENTS.BY_STATUS, { params: { statuses: status.toUpperCase() } })
        .then(res => ({ ...res, data: (res.data || []).map(transformBaseData) })),

    getMyEvents: (accountId) => axiosClient.get(API_ENDPOINTS.EVENTS.MY_EVENTS, { params: { accountId } })
        .then(res => ({ ...res, data: (res.data || []).map(transformBaseData) })),

    update: (id, data) => axiosClient.put(`${API_ENDPOINTS.EVENTS.BASE}/update/${id}`, data),
    
    delete: (id) => axiosClient.put(`${API_ENDPOINTS.EVENTS.BASE}/delete/${id}`),
  },

  // NHÓM KẾ HOẠCH (PLANS)
  plans: {
    getAll: (params = {}) => 
            axiosClient.get(API_ENDPOINTS.EVENTS.PLANS, { params }),

    getById: (id) => axiosClient.get(`${API_ENDPOINTS.EVENTS.PLANS}/${id}`)
        .then(res => ({ ...res, data: transformBaseData(res.data) })),

    create: (data, submit = false) => axiosClient.post(`${API_ENDPOINTS.EVENTS.PLANS}?submit=${submit}`, data),

    update: (id, data) => axiosClient.put(`${API_ENDPOINTS.EVENTS.PLANS}/${id}`, data),

    delete: (id) => axiosClient.delete(`${API_ENDPOINTS.EVENTS.PLANS}/${id}`),

    submit: (id) => axiosClient.post(`${API_ENDPOINTS.EVENTS.PLANS}/${id}/submit`),
  },

  // NHÓM ĐĂNG KÝ (REGISTRATIONS)
  registrations: {
    check: (eventId, userProfileId) => axiosClient.get(API_ENDPOINTS.REGISTRATIONS.CHECK, { params: { eventId, userProfileId } }),
    
    register: (eventId, userProfileId) => axiosClient.post(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}/register`, null, { params: { userProfileId } }),
    
    getQR: (registrationId) => axiosClient.get(API_ENDPOINTS.EVENTS.GET_QR(registrationId)),

    cancel: (eventId) => axiosClient.patch(`/events/api/registrations/cancel/${eventId}`), // Đường dẫn tùy backend
    
    checkIn: (token) => axiosClient.post(`${API_ENDPOINTS.EVENTS.BASE}/check-in`, { token }),

    getUsersByEvent: (eventId) => axiosClient.get(`${API_ENDPOINTS.REGISTRATIONS.BASE}/event/${eventId}`),
    
    getUserHistory: (userProfileId) => axiosClient.get(`${API_ENDPOINTS.REGISTRATIONS.BASE}/user/${userProfileId}`),
  },

  // ADMIN OPS
  admin: {
    approvePlan: (id) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.ADMIN}/plans/${id}/approve`),
    rejectPlan: (id, reason) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.ADMIN}/plans/${id}/reject`, null, { params: { reason } }),
    approveEvent: (id) => axiosClient.patch(`${API_ENDPOINTS.EVENTS.ADMIN}/events/${id}/approve`),
  },

  draw: {
    createEntry: (drawId) => axiosClient.post(API_ENDPOINTS.DRAW.CREATE_ENTRY(drawId)),
  }
};