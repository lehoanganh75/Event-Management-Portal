import axios from 'axios';

const BASE_URL = 'http://localhost:8082';
const IDENTITY_BASE_URL = 'http://localhost:8083';

// 1. PUBLIC API
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
});

// 2. PRIVATE API
const privateApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
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

// Helper for data transformation
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
    };
};

const transformListResponse = (res) => ({
    ...res,
    data: (Array.isArray(res.data) ? res.data : res.data?.content || []).map(transformBaseData)
});

const eventService = {
    // --- GROUP 1: PUBLIC / GENERAL EVENTS ---
    getEventsForUser: (params = {}) => publicApi.get('/events', { params }).then(transformListResponse),
    getOngoingEvents: () => publicApi.get('/events/ongoing').then(transformListResponse),
    getUpcomingEvents: () => publicApi.get('/events/upcoming-week').then(transformListResponse),
    getFeaturedEvents: () => publicApi.get('/events/featured').then(transformListResponse),
    getCompletedEvents: () => publicApi.get('/events/news').then(transformListResponse),
    getEventById: (id) => publicApi.get(`/events/${id}`).then(res => ({ ...res, data: transformBaseData(res.data) })),
    getByStatus: (status) => privateApi.get('/events/by-statuses', { params: { statuses: status.toUpperCase() } }).then(res => ({ ...res, data: (res.data || []).map(transformBaseData) })),
    getAllPlans: (params = {}) => publicApi.get('/events/plans', { params }).then(transformListResponse),

    // --- Related Info (Public) ---
    getPresenters: (eventId) => publicApi.get(`/events/${eventId}/presenters`),
    getParticipants: (eventId) => publicApi.get(`/events/${eventId}/participants`),
    getOrganizers: (eventId) => publicApi.get(`/events/${eventId}/organizers`),
    registerParticipant: (eventId, data) => publicApi.post(`/events/${eventId}/participants/register`, data),

    getAllOrganizations: () => privateApi.get('/organizations'),
    createOrganization: (data) => privateApi.post('/organizations', data),

    // --- GROUP 2: AUTHENTICATED / MY EVENTS ---
    getMyEvents: (role = 'ALL') => privateApi.get('/events/my-events', { params: { role } }).then(transformListResponse),
    getAdminAllEvents: () => privateApi.get('/events/admin/all').then(transformListResponse),
    updateLuckyDraw: (eventId) => privateApi.put(`/events/${eventId}/lucky-draw`),
    createEvent: (payload) => {
        if (payload instanceof FormData) {
            return privateApi.post('/events', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return privateApi.post('/events', payload);
    },
    updateEvent: (id, data) => privateApi.put(`/events/update/${id}`, data),
    deleteEvent: (id) => privateApi.delete(`/events/delete/${id}`),
    cancelEvent: (id, reason) => privateApi.patch(`/events/${id}/cancel`, null, { params: { reason } }),

    // --- GROUP 3: POSTS ---
    getAllPosts: (params) => publicApi.get('/posts', { params }),
    getPostById: (id) => publicApi.get(`/posts/${id}`),
    getEventPosts: (eventId) => publicApi.get(`/posts/detail/${eventId}`),
    getPostsByUser: (accountId) => privateApi.get(`/posts/user/${accountId}`),
    createPost: (postData) => privateApi.post('/posts', postData),
    updatePost: (id, postDetails) => privateApi.put(`/posts/${id}`, postDetails),
    deletePost: (id) => privateApi.delete(`/posts/${id}`),
    reactToPost: (postId, data) => privateApi.post(`/posts/${postId}/react`, data),

    // --- Comments ---
    createComment: (postId, data) => privateApi.post(`/posts/comments/${postId}`, data),
    getComments: (postId) => privateApi.get(`/posts/comments/${postId}`),
    deleteComment: (commentId) => privateApi.delete(`/posts/comments/${commentId}`),
    reactToComment: (commentId, data) => privateApi.post(`/posts/comments/${commentId}/react`, data),

    // --- GROUP 4: TEMPLATES ---
    getTemplates: () => privateApi.get('/templates'),
    getTemplateById: (id) => privateApi.get(`/templates/${id}`).then(res => res.data),
    getAllTemplates: (organizationId, search = '', { page = 0, size = 10, sortBy = 'usageCount', direction = 'desc' } = {}) =>
        privateApi.get('/templates/all', { params: { organizationId, search, page, size, sortBy, direction } }).then(res => res.data),
    createTemplate: (data) => privateApi.post('/templates', data),
    updateTemplate: (id, data) => privateApi.put(`/templates/${id}`, data),
    deleteTemplate: (id) => privateApi.delete(`/templates/${id}`),
    toggleTemplateStar: (id) => privateApi.patch(`/templates/${id}/star`),
    incrementTemplateUsage: (id) => privateApi.post(`/templates/${id}/increment-usage`),
    recommendTemplates: (description, limit = 5) => 
        privateApi.post('/templates/recommend', description, { 
            headers: { 'Content-Type': 'text/plain' },
            params: { limit }
        }).then(res => res.data),

    // --- GROUP 5: PLANS ---
    getMyPlans: () => privateApi.get('/events/plans/my').then(transformListResponse),
    getPlanById: (id) => privateApi.get(`/events/plans/${id}`).then(res => ({ ...res, data: transformBaseData(res.data) })),
    getPlansByStatus: (statusName, accountId) => privateApi.get(`/events/plans/status/${statusName}`, { params: { accountId } }),
    createPlan: (data, submit = false) => privateApi.post(`/events/plans?submit=${submit}`, data),
    updatePlan: (id, data) => privateApi.put(`/events/plans/${id}`, data),
    deletePlan: (id) => privateApi.delete(`/events/plans/${id}`),
    submitPlanForApproval: (id) => privateApi.post(`/events/plans/${id}/submit`),
    createEventFromPlan: (id, payload = {}) => privateApi.post(`/events/plans/${id}/create-event`, payload),

    // --- GROUP 6: REGISTRATIONS ---
    checkRegistration: (eventId) => privateApi.get(`/registrations/check/${eventId}`),
    registerEvent: (eventId) => privateApi.post(`/registrations/${eventId}`),
    getTicketByEventId: (id) => privateApi.get(`/registrations/${id}`),
    getQR: (registrationId) => privateApi.get(`/registrations/${registrationId}/qr`),
    cancelRegistration: (eventId) => privateApi.patch(`/registrations/cancel/${eventId}`),
    getUsersByEvent: (eventId) => privateApi.get(`/registrations/event/${eventId}`),
    checkIn: (payload) => privateApi.post('/registrations/check-in', payload),
    manualCheckIn: (registrationId, adminAccountId) => privateApi.post(`/registrations/${registrationId}/manual-check-in`, null, { params: { adminAccountId } }),
    undoCheckIn: (registrationId) => privateApi.post(`/registrations/${registrationId}/undo-check-in`),
    updateCheckInTime: (registrationId, newTime) => privateApi.put(`/registrations/${registrationId}/check-in-time`, null, { params: { newTime } }),

    getEventQRToken: (eventId) => privateApi.get(`/registrations/event/${eventId}/qr-token`),
    checkInByEventToken: (token) => privateApi.post('/registrations/check-in/event', { token }),
    toggleCheckIn: (eventId, enabled) => privateApi.patch(`/registrations/event/${eventId}/toggle-check-in`, null, { params: { enabled } }),
    updateQRType: (eventId, qrType) => privateApi.patch(`/registrations/event/${eventId}/qr-type`, null, { params: { qrType } }),

    // --- QUIZ API ---
    // AI Planning
    aiPlanning: {
        generateFromTemplate: (templateId, userContext) => 
            privateApi.post('/api/v1/ai-planning/from-template', { templateId, userContext }),
        generateFromRawText: (rawText) => 
            privateApi.post('/api/v1/ai-planning/from-raw-text', { rawText }),
    },
    createQuiz: (quizData) => privateApi.post('/quizzes', quizData),
    startQuiz: (quizId) => privateApi.post(`/quizzes/${quizId}/start`),
    nextQuizQuestion: (quizId, index) => privateApi.post(`/quizzes/${quizId}/next`, null, { params: { index } }),
    submitQuizAnswer: (submission) => privateApi.post('/quizzes/submit', submission),
    getQuizLeaderboard: (quizId) => privateApi.get(`/quizzes/${quizId}/leaderboard`),
    importQuizFromWord: (eventId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return privateApi.post(`/quizzes/import/${eventId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // --- SURVEY API ---
    getSurveyByEvent: (eventId) => publicApi.get(`/surveys/event/${eventId}`),
    createOrUpdateSurvey: (surveyData) => privateApi.post('/surveys', surveyData),
    publishSurvey: (surveyId) => privateApi.post(`/surveys/${surveyId}/publish`),
    submitSurveyResponse: (surveyId, answers) => privateApi.post(`/surveys/${surveyId}/submit`, { answers }),
    checkSurveySubmission: (surveyId) => privateApi.get(`/surveys/${surveyId}/has-submitted`),
    importSurveyFromWord: (eventId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return privateApi.post(`/surveys/import/${eventId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // --- GROUP 7: ADMIN APPROVAL ---
    getPlansPendingApproval: () => privateApi.get('/events/admin/plans/pending'),
    getEventsPendingApproval: () => privateApi.get('/events/admin/events/pending'),
    approvePlan: (id) => privateApi.patch(`/events/admin/plans/${id}/approve`),
    rejectPlan: (id, reason) => privateApi.patch(`/events/admin/plans/${id}/reject`, null, { params: { reason } }),
    approveEvent: (id) => privateApi.patch(`/events/admin/events/${id}/approve`),
    rejectEvent: (id, reason) => privateApi.patch(`/events/admin/events/${id}/reject`, null, { params: { reason } }),

    // --- GROUP 8: LUCKY DRAW ---
    createLuckyDrawEntry: (drawId) => privateApi.post(`/entries/${drawId}`),

    // --- GROUP 9: AI CHAT ---
    createChatSession: (data) => privateApi.post('/api/v1/chat/sessions', data),
    sendChatMessage: (data) => privateApi.post('/api/v1/chat/messages', data),

    // --- GROUP 10: UTILS ---
    uploadImage: (formData) => privateApi.post('/events/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    // --- GROUP 11: INVITATIONS ---
    getInvitationDetails: (eventId, token) => publicApi.get(`/events/${eventId}/invitations`, { params: { token } }),
    acceptInvitation: (eventId, token) => publicApi.post(`/events/${eventId}/accept-invite`, null, { params: { token } }),
    rejectInvitation: (eventId, token, reason) => publicApi.post(`/events/${eventId}/reject-invite`, null, { params: { token, reason } }),

    sendOrganizerInvitations: (eventId, payload) => privateApi.post(`/events/${eventId}/organizer-invitations`, payload),
    sendPresenterInvitations: (eventId, payload) => privateApi.post(`/events/${eventId}/presenter-invitations`, payload),
    cancelInvitation: (invitationId) => privateApi.delete(`/events/invitations/${invitationId}`),
    removeOrganizer: (organizerId) => privateApi.delete(`/events/organizers/${organizerId}`),
    removePresenter: (presenterId) => privateApi.delete(`/events/presenters/${presenterId}`),

    getEventSummary: (id) => publicApi.get(`/events/${id}/summary`),
    getOrganizerRoles: () => privateApi.get('/events/organizer-roles').then(res => res.data),

    leaveTeam: (eventId) => privateApi.post(`/events/${eventId}/organizers/leave`),
    approveLeaveRequest: (organizerId) => privateApi.post(`/events/organizers/${organizerId}/approve-leave`),
    rejectLeaveRequest: (organizerId) => privateApi.post(`/events/organizers/${organizerId}/reject-leave`),
};

export default eventService;