// src/services/eventService.js
import axiosClient from '../api/axiosClient';

const eventService = {
    // ==================== EVENT BASIC ====================
    getAllActiveEvents: () => axiosClient.get('/events/events'),
    
    getAllEvents: () => axiosClient.get('/events/events/all'),
    
    getFeaturedEvents: () => axiosClient.get('/events/events/featured'), // Fix lỗi 404 tại đây
    
    getEventById: (id) => axiosClient.get(`/events/events/${id}`),
    
    getEventByIdForAdmin: (id) => axiosClient.get(`/events/events/admin/${id}`),

    // ==================== POSTS (Bài đăng sự kiện) - MỚI CẬP NHẬT ====================
    // Lấy tất cả bài đăng (hỗ trợ phân trang, tìm kiếm, lọc trạng thái)
    getAllPosts: (params) => axiosClient.get('/events/posts', { params }),

    // Lấy chi tiết 1 bài đăng
    getPostById: (id) => axiosClient.get(`/events/posts/${id}`),

    // Tạo bài đăng mới
    createPost: (postData) => axiosClient.post('/events/posts', postData),

    // Cập nhật bài đăng
    updatePost: (id, postDetails) => axiosClient.put(`/events/posts/${id}`, postDetails),

    // Xóa bài đăng
    deletePost: (id) => axiosClient.delete(`/events/posts/${id}`),

    // Lấy bài đăng theo Account ID
    getPostsByAccountId: (accountId) => axiosClient.get(`/events/posts/user/${accountId}`),

    // Lấy bài đăng theo Account ID và Event ID cụ thể
    getPostsByAccountIdAndEventId: (accountId, eventId) => 
        axiosClient.get(`/events/posts/user/${accountId}/event/${eventId}`),

    // ==================== REGISTRATIONS (Đăng ký & Trạng thái) ====================
    // Hàm đăng ký mới
    registerToEvent: (eventId) => 
        axiosClient.post(`/events/registrations/${eventId}`),

    // Hàm kiểm tra trạng thái đăng ký của user hiện tại (Thay thế events.events.get)
    checkRegistration: (eventId) => 
        axiosClient.get(`/events/registrations/check/${eventId}`),

    // Hàm hủy đăng ký (Thay thế events.events.put)
    cancelRegistration: (eventId) => 
        axiosClient.put(`/events/registrations/cancel/${eventId}`),

    // Lấy QR Code
    getQR: (registrationId) => 
        axiosClient.get(`/events/registrations/${registrationId}/qr`),

    // ==================== MY EVENTS ====================
    getMyEvents: () => axiosClient.get('/events/events/my-events'),
    
    getMyEventsThisMonth: () => axiosClient.get('/events/events/my-events/this-month'),

    // ==================== PLANS (Kế hoạch sự kiện) ====================
    getAllPlans: () => axiosClient.get('/events/events/plans'),
    
    getMyPlans: () => axiosClient.get('/events/events/plans/my'),
    
    getPlansByStatus: (statusName, accountId) => 
        axiosClient.get(`/events/plans/status/${statusName}`, { 
            params: { accountId } 
        }),

    createPlan: (planData) => axiosClient.post('/events/plans', planData),
    
    updatePlan: (id, planDetails) => axiosClient.put(`/events/plans/${id}`, planDetails),
    
    deletePlan: (id) => axiosClient.delete(`/events/plans/${id}`),
    
    submitPlanForApproval: (id) => axiosClient.post(`/events/plans/${id}/submit`),

    // ==================== APPROVAL (Admin) ====================
    getPlansPendingApproval: () => axiosClient.get('/events/admin/plans/pending'),
    
    getEventsPendingApproval: () => axiosClient.get('/events/admin/events/pending'),

    approvePlan: (id) => axiosClient.patch(`/events/admin/plans/${id}/approve`),
    
    rejectPlan: (id, reason) => 
        axiosClient.patch(`/events/admin/plans/${id}/reject`, null, {
            params: { reason }
        }),

    approveEvent: (id) => axiosClient.patch(`/events/admin/events/${id}/approve`),
    
    rejectEvent: (id, reason) => 
        axiosClient.patch(`/events/admin/events/${id}/reject`, null, {
            params: { reason }
        }),

    createEventFromPlan: (planId, eventDetails) => 
        axiosClient.post(`/events/plans/${planId}/create-event`, eventDetails),

    // ==================== EVENT STATUS ACTIONS ====================
    startEvent: (id) => axiosClient.patch(`/events/${id}/start`),
    
    completeEvent: (id) => axiosClient.patch(`/events/${id}/complete`),
    
    cancelEvent: (id, reason) => 
        axiosClient.patch(`/events/${id}/cancel`, null, { params: { reason } }),

    // ==================== CRUD Event ====================
    createEvent: (event) => axiosClient.post('/events', event),
    
    updateEvent: (id, eventDetails) => axiosClient.put(`/events/update/${id}`, eventDetails),
    
    deleteEvent: (id) => axiosClient.put(`/events/delete/${id}`),   // backend dùng PUT /delete

    updateLuckyDrawId: (id, luckyDrawId) => 
        axiosClient.put(`/events/${id}/lucky-draw`, null, { params: { luckyDrawId } }),

    // ==================== PRESENTERS ====================
    getPresenters: (eventId) => axiosClient.get(`/events/${eventId}/presenters`),
    
    addPresenter: (eventId, presenter) => 
        axiosClient.post(`/events/${eventId}/presenters`, presenter),
    
    removePresenter: (presenterId) => axiosClient.delete(`/events/presenters/${presenterId}`),
    
    updatePresenterTopic: (presenterId, topic) => 
        axiosClient.patch(`/events/presenters/${presenterId}/topic`, null, { params: { topic } }),

    // ==================== PARTICIPANTS ====================
    getParticipants: (eventId) => axiosClient.get(`/events/${eventId}/participants`),
    
    registerParticipant: (eventId, participant) => 
        axiosClient.post(`/events/${eventId}/participants/register`, participant),
    
    cancelParticipant: (participantId, reason) => 
        axiosClient.delete(`/events/participants/${participantId}`, { 
            params: { reason } 
        }),

    checkInParticipant: (participantId, checkedInBy) => 
        axiosClient.patch(`/events/participants/${participantId}/checkin`, null, {
            params: { checkedInBy }
        }),

    checkIn: (token) => axiosClient.post('/events/events/registrations/check-in', { qrToken: token }),

    countParticipants: (eventId) => axiosClient.get(`/events/${eventId}/participants/count`),

    // ==================== ORGANIZERS ====================
    getOrganizers: (eventId) => axiosClient.get(`/events/${eventId}/organizers`),
    
    addOrganizer: (eventId, organizer) => 
        axiosClient.post(`/events/${eventId}/organizers`, organizer),

    removeOrganizer: (organizerId) => axiosClient.delete(`/events/organizers/${organizerId}`),

    // ==================== INVITE & REGISTRATION ====================
    inviteParticipants: (eventId, inviteeIds) => 
        axiosClient.post(`/events/${eventId}/invite`, inviteeIds),

    acceptInvite: (eventId, token) => 
        axiosClient.get(`/events/${eventId}/accept-invite`, { 
            params: { token } 
        }),

    getAllTemplates: (organizationId, search = '', { page = 0, size = 10, sortBy = 'usageCount', direction = 'desc' } = {}) => 
        axiosClient.get('/events/templates/all', {
            params: {
                organizationId,
                search,
                page,
                size,
                sortBy,
                direction
            }
        }),

    // Thêm các hàm CRUD template khác nếu cần
    createTemplate: (data) => axiosClient.post('/events/templates', data),
    
    updateTemplate: (id, data) => axiosClient.put(`/events/templates/${id}`, data),
    
    deleteTemplate: (id) => axiosClient.delete(`/events/templates/${id}`),

    getTemplateById: (id) => axiosClient.get(`/events/templates/${id}`),
};

export default eventService;