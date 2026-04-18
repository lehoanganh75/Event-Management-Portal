import axios from 'axios';

const EVENT_URL = "http://localhost:8082";

// --- INSTANCE 1: DÀNH CHO PUBLIC (Không gắn Interceptor chặn lỗi 401) ---
const publicApi = axios.create({
    baseURL: EVENT_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// --- INSTANCE 2: DÀNH CHO PRIVATE (Có đầy đủ Interceptor) ---
const privateApi = axios.create({
    baseURL: EVENT_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Request Interceptor cho Private
privateApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor cho Private - Xử lý Refresh Token
privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error();

                // Refresh Token gọi sang Auth Service (Port 8080)
                const res = await axios.post(`http://localhost:8080/auth/refresh`, { refreshToken });
                const { accessToken } = res.data;
                
                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return privateApi(originalRequest);
            } catch (_err) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const eventService = {
    // Sử dụng publicApi: Không sợ bị chặn khi token hết hạn
    getEventsForUser: () => publicApi.get('/events'),
    getOngoingEvents: () => publicApi.get('/events/ongoing'),
    getUpcomingEvents: () => publicApi.get('/events/upcoming-week'),
    getFeaturedEvents: () => publicApi.get('/events/featured'),
    getCompletedEvents: () => publicApi.get('events/news'),
    getEventPosts: (eventId) => publicApi.get(`/posts/detail/${eventId}`),

    // Sử dụng privateApi: Bắt buộc check token/refresh token
    getEventById: (id) => privateApi.get(`/events/${id}`),
    getMyEvents: (role = 'ALL') => privateApi.get('/events/my-events', { params: { role } }),
    getAdminAllEvents: () => privateApi.get('/events/admin/all'),
    updateLuckyDraw: (eventId) => privateApi.put(`/events/${eventId}/lucky-draw`),
    
    registerEvent: (id) => privateApi.post(`/registrations/register/${id}`),
    getTicketByEventId: (id) => privateApi.get(`/registrations/${id}`),

    getAllPosts: (params) => privateApi.get('/posts', { params }),
    getPostById: (id) => privateApi.get(`/posts/${id}`),
    createPost: (postData) => privateApi.post('/posts', postData),
    updatePost: (id, postDetails) => privateApi.put(`/posts/${id}`, postDetails),
    deletePost: (id) => privateApi.delete(`/posts/${id}`),

    getTemplates: () => privateApi.get('/templates'),
    getTemplatesById: (id) => privateApi.get(`/templates/${id}`)
};

export default eventService;
    // // Lấy bài đăng theo Account ID
    // getPostsByAccountId: (accountId) => eventApi.get(`/events/posts/user/${accountId}`),

    // // Lấy bài đăng theo Account ID và Event ID cụ thể
    // getPostsByAccountIdAndEventId: (accountId, eventId) => 
    //     eventApi.get(`/events/posts/user/${accountId}/event/${eventId}`),

    // // ==================== REGISTRATIONS (Đăng ký & Trạng thái) ====================
    // // Hàm đăng ký mới
    // registerToEvent: (eventId) => 
    //     eventApi.post(`/events/registrations/${eventId}`),

    // // Hàm kiểm tra trạng thái đăng ký của user hiện tại (Thay thế events.events.get)
    // checkRegistration: (eventId) => 
    //     eventApi.get(`/events/registrations/check/${eventId}`),

    // // Hàm hủy đăng ký (Thay thế events.events.put)
    // cancelRegistration: (eventId) => 
    //     eventApi.put(`/events/registrations/cancel/${eventId}`),

    // // Lấy QR Code
    // getQR: (registrationId) => 
    //     eventApi.get(`/events/registrations/${registrationId}/qr`),

    // // ==================== MY EVENTS ====================
    // getMyEvents: () => eventApi.get('/events/events/my-events'),
    
    // getMyEventsThisMonth: () => eventApi.get('/events/events/my-events/this-month'),

    // // ==================== PLANS (Kế hoạch sự kiện) ====================
    // getAllPlans: () => eventApi.get('/events/events/plans'),
    
    // getMyPlans: () => eventApi.get('/events/events/plans/my'),
    
    // getPlansByStatus: (statusName, accountId) => 
    //     eventApi.get(`/events/plans/status/${statusName}`, { 
    //         params: { accountId } 
    //     }),

    // createPlan: (planData) => eventApi.post('/events/plans', planData),
    
    // updatePlan: (id, planDetails) => eventApi.put(`/events/plans/${id}`, planDetails),
    
    // deletePlan: (id) => eventApi.delete(`/events/plans/${id}`),
    
    // submitPlanForApproval: (id) => eventApi.post(`/events/plans/${id}/submit`),

    // // ==================== APPROVAL (Admin) ====================
    // getPlansPendingApproval: () => eventApi.get('/events/admin/plans/pending'),
    
    // getEventsPendingApproval: () => eventApi.get('/events/admin/events/pending'),

    // approvePlan: (id) => eventApi.patch(`/events/admin/plans/${id}/approve`),
    
    // rejectPlan: (id, reason) => 
    //     eventApi.patch(`/events/admin/plans/${id}/reject`, null, {
    //         params: { reason }
    //     }),

    // approveEvent: (id) => eventApi.patch(`/events/admin/events/${id}/approve`),
    
    // rejectEvent: (id, reason) => 
    //     eventApi.patch(`/events/admin/events/${id}/reject`, null, {
    //         params: { reason }
    //     }),

    // createEventFromPlan: (planId, eventDetails) => 
    //     eventApi.post(`/events/plans/${planId}/create-event`, eventDetails),

    // // ==================== EVENT STATUS ACTIONS ====================
    // startEvent: (id) => eventApi.patch(`/events/${id}/start`),
    
    // completeEvent: (id) => eventApi.patch(`/events/${id}/complete`),
    
    // cancelEvent: (id, reason) => 
    //     eventApi.patch(`/events/${id}/cancel`, null, { params: { reason } }),

    // // ==================== CRUD Event ====================
    // createEvent: (event) => eventApi.post('/events', event),
    
    // updateEvent: (id, eventDetails) => eventApi.put(`/events/update/${id}`, eventDetails),
    
    // deleteEvent: (id) => eventApi.put(`/events/delete/${id}`),   // backend dùng PUT /delete

    // updateLuckyDrawId: (id, luckyDrawId) => 
    //     eventApi.put(`/events/${id}/lucky-draw`, null, { params: { luckyDrawId } }),

    // // ==================== PRESENTERS ====================
    // getPresenters: (eventId) => eventApi.get(`/events/${eventId}/presenters`),
    
    // addPresenter: (eventId, presenter) => 
    //     eventApi.post(`/events/${eventId}/presenters`, presenter),
    
    // removePresenter: (presenterId) => eventApi.delete(`/events/presenters/${presenterId}`),
    
    // updatePresenterTopic: (presenterId, topic) => 
    //     eventApi.patch(`/events/presenters/${presenterId}/topic`, null, { params: { topic } }),

    // // ==================== PARTICIPANTS ====================
    // getParticipants: (eventId) => eventApi.get(`/events/${eventId}/participants`),
    
    // registerParticipant: (eventId, participant) => 
    //     eventApi.post(`/events/${eventId}/participants/register`, participant),
    
    // cancelParticipant: (participantId, reason) => 
    //     eventApi.delete(`/events/participants/${participantId}`, { 
    //         params: { reason } 
    //     }),

    // checkInParticipant: (participantId, checkedInBy) => 
    //     eventApi.patch(`/events/participants/${participantId}/checkin`, null, {
    //         params: { checkedInBy }
    //     }),

    // checkIn: (token) => eventApi.post('/events/events/registrations/check-in', { qrToken: token }),

    // countParticipants: (eventId) => eventApi.get(`/events/${eventId}/participants/count`),

    // // ==================== ORGANIZERS ====================
    // getOrganizers: (eventId) => eventApi.get(`/events/${eventId}/organizers`),
    
    // addOrganizer: (eventId, organizer) => 
    //     eventApi.post(`/events/${eventId}/organizers`, organizer),

    // removeOrganizer: (organizerId) => eventApi.delete(`/events/organizers/${organizerId}`),

    // // ==================== INVITE & REGISTRATION ====================
    // inviteParticipants: (eventId, inviteeIds) => 
    //     eventApi.post(`/events/${eventId}/invite`, inviteeIds),

    // acceptInvite: (eventId, token) => 
    //     eventApi.get(`/events/${eventId}/accept-invite`, { 
    //         params: { token } 
    //     }),

    // getAllTemplates: (organizationId, search = '', { page = 0, size = 10, sortBy = 'usageCount', direction = 'desc' } = {}) => 
    //     eventApi.get('/events/templates/all', {
    //         params: {
    //             organizationId,
    //             search,
    //             page,
    //             size,
    //             sortBy,
    //             direction
    //         }
    //     }),

    // // Thêm các hàm CRUD template khác nếu cần
    // createTemplate: (data) => eventApi.post('/events/templates', data),
    
    // updateTemplate: (id, data) => eventApi.put(`/events/templates/${id}`, data),
    
    // deleteTemplate: (id) => eventApi.delete(`/events/templates/${id}`),

    // getTemplateById: (id) => eventApi.get(`/events/templates/${id}`),