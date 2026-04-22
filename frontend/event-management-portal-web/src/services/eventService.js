import axiosClient from '../api/axiosClient';

const eventService = {
    // --- GRUOP 1: PUBLIC (Dành cho khách & user) ---
    getEventsForUser: () => axiosClient.get('/event/events'),
    getOngoingEvents: () => axiosClient.get('/event/events/ongoing'),
    getUpcomingEvents: () => axiosClient.get('/event/events/upcoming-week'),
    getFeaturedEvents: () => axiosClient.get('/event/events/featured'),
    getCompletedEvents: () => axiosClient.get('/event/events/news'),
    getEventPosts: (eventId) => axiosClient.get(`/event/posts/detail/${eventId}`),
    getEventById: (id) => axiosClient.get(`/event/events/${id}`),

    // --- GROUP 2: AUTHENTICATED (Yêu cầu login) ---
    getMyEvents: (role = 'ALL') => axiosClient.get('/event/events/my-events', { params: { role } }),
    getAdminAllEvents: () => axiosClient.get('/event/events/admin/all'),
    updateLuckyDraw: (eventId) => axiosClient.put(`/event/events/${eventId}/lucky-draw`),
    
    registerEvent: (id) => axiosClient.post(`/event/registrations/register/${id}`),
    getTicketByEventId: (id) => axiosClient.get(`/event/registrations/${id}`),

    // --- GROUP 3: POSTS ---
    getAllPosts: (params) => axiosClient.get('/event/posts', { params }),
    getPostById: (id) => axiosClient.get(`/event/posts/${id}`),
    createPost: (postData) => axiosClient.post('/event/posts', postData),
    updatePost: (id, postDetails) => axiosClient.put(`/event/posts/${id}`, postDetails),
    deletePost: (id) => axiosClient.delete(`/event/posts/${id}`),

    // --- GROUP 4: TEMPLATES ---
    getTemplates: () => axiosClient.get('/event/templates'),
    getTemplatesById: (id) => axiosClient.get(`/event/templates/${id}`),
    createTemplate: (data) => axiosClient.post('/event/templates', data),
    updateTemplate: (id, data) => axiosClient.put(`/event/templates/${id}`, data),
    deleteTemplate: (id) => axiosClient.delete(`/event/templates/${id}`),

    // --- GROUP 5: PLANS ---
    getAllPlans: () => axiosClient.get('/event/events/plans'),
    getMyPlans: () => axiosClient.get('/event/events/plans/my'),
    getPlansByStatus: (statusName, accountId) => 
        axiosClient.get(`/event/events/plans/status/${statusName}`, { 
            params: { accountId } 
        }),

    createPlan: (planData) => axiosClient.post('/event/events/plans', planData),
    updatePlan: (id, planDetails) => axiosClient.put(`/event/events/plans/${id}`, planDetails),
    deletePlan: (id) => axiosClient.delete(`/event/events/plans/${id}`),
    submitPlanForApproval: (id) => axiosClient.post(`/event/events/plans/${id}/submit`),

    // --- GROUP 6: ADMIN APPROVAL ---
    getPlansPendingApproval: () => axiosClient.get('/event/events/admin/plans/pending'),
    getEventsPendingApproval: () => axiosClient.get('/event/events/admin/events/pending'),

    approvePlan: (id) => axiosClient.patch(`/event/events/admin/plans/${id}/approve`),
    rejectPlan: (id, reason) => 
        axiosClient.patch(`/event/events/admin/plans/${id}/reject`, null, {
            params: { reason }
        }),

    approveEvent: (id) => axiosClient.patch(`/event/events/admin/events/${id}/approve`),
    rejectEvent: (id, reason) => 
        axiosClient.patch(`/event/events/admin/events/${id}/reject`, null, {
            params: { reason }
        }),
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