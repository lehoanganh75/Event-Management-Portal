import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const IDENTITY_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/identity';


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
    getEventsForUser: (params = {}) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/events', { params }).then(transformListResponse);
    },
    getOngoingEvents: () => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/events/ongoing').then(transformListResponse);
    },
    getUpcomingEvents: () => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/events/upcoming-week').then(transformListResponse);
    },
    getFeaturedEvents: () => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/events/featured').then(transformListResponse);
    },
    getCompletedEvents: () => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/events/news').then(transformListResponse);
    },
    getEventById: (id) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/events/${id}`).then(res => ({ ...res, data: transformBaseData(res.data) }));
    },
    getEventBySlug: (slug) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/events/${slug}`).then(res => ({ ...res, data: transformBaseData(res.data) }));
    },
    getByStatus: (status) => {
        const statuses = status.split(',').map(s => s.trim().toUpperCase());
        return privateApi.get('/events/by-statuses', {
            params: { statuses },
            paramsSerializer: {
                indexes: null // Tránh statuses[0]=... mà dùng statuses=...
            }
        }).then(res => ({ ...res, data: (res.data || []).map(transformBaseData) }));
    },
    getAllPlans: (params = {}) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/events/plans', { params }).then(transformListResponse);
    },

    // --- Related Info (Public) ---
    getPresenters: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/events/${eventId}/presenters`);
    },
    getParticipants: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/events/${eventId}/participants`);
    },
    getOrganizers: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/events/${eventId}/organizers`);
    },
    registerParticipant: (eventId, data) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.post(`/events/${eventId}/participants/register`, data);
    },

    getAllOrganizations: () => privateApi.get('/organizations'),
    createOrganization: (data) => privateApi.post('/organizations', data),

    // --- GROUP 2: AUTHENTICATED / MY EVENTS ---
    getMyEvents: () => privateApi.get('/events/my-events').then(transformListResponse),
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
    getMyInvolvedPosts: () => privateApi.get('/posts/my-involved').then(res => res.data),
    getAllPosts: (params) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get('/posts', { params }).then(transformListResponse);
    },
    getPostById: (id) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/posts/${id}`).then(res => ({ ...res, data: transformBaseData(res.data) }));
    },
    getEventPosts: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/posts/detail/${eventId}`).then(transformListResponse);
    },
    getPostsByUser: (accountId) => privateApi.get(`/posts/user/${accountId}`),
    createPost: (postData) => privateApi.post('/posts', postData),
    updatePost: (id, postDetails) => privateApi.put(`/posts/${id}`, postDetails),
    deletePost: (id) => privateApi.delete(`/posts/${id}`),
    reactToPost: (postId, data) => privateApi.post(`/posts/${postId}/react`, data),
    incrementPostView: (postId) => publicApi.post(`/posts/${postId}/view`),

    // --- Comments ---
    createComment: (postId, data) => {
        if (data instanceof FormData) {
            return privateApi.post(`/posts/comments/${postId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return privateApi.post(`/posts/comments/${postId}`, data);
    },
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
        generateFromTemplate: (template, userContext) => {
            const prompt = `Bạn là một chuyên gia lập kế hoạch sự kiện. Dựa trên mẫu sự kiện "${template.templateName}" (Mô tả mẫu: ${template.description}) và yêu cầu bổ sung của người dùng: "${userContext}", hãy lập một kế hoạch chi tiết.
            YÊU CẦU QUAN TRỌNG: 
            1. Trả về DUY NHẤT một khối JSON hợp lệ. KHÔNG giải thích thêm.
            2. Tất cả thời gian (startTime, endTime) PHẢI ở tương lai (sau tháng 5 năm 2026).
            3. Nếu trong nội dung có dấu ngoặc kép, hãy dùng dấu nháy đơn hoặc escape nó bằng \\".
            
            Cấu trúc JSON:
            {
              "title": "Tên sự kiện",
              "purpose": "Mục đích sự kiện",
              "description": "Mô tả chi tiết",
              "subject": "Chủ đề",
              "suggestedLocation": "Địa điểm",
              "estimatedParticipants": 100,
              "suggestedStartTime": "2026-06-01T09:00:00",
              "suggestedEndTime": "2026-06-01T11:00:00",
              "programItems": [
                {
                  "title": "Tên phiên",
                  "description": "Mô tả phiên",
                  "startTime": "2026-06-01T09:00:00",
                  "endTime": "2026-06-01T09:30:00",
                  "durationMinutes": 30,
                  "speaker": "Diễn giả",
                  "location": "Phòng/Vị trí"
                }
              ],
              "reasoning": "Lý do đề xuất"
            }`;
            return axios.post(`${BASE_URL}/ai/api/chat`, { prompt });
        },
        generateFromRawText: (rawText) => {
            const prompt = `Bạn là một chuyên gia lập kế hoạch sự kiện. Hãy trích xuất và đề xuất thông tin sự kiện từ văn bản sau. 
            YÊU CẦU QUAN TRỌNG: 
            1. Trả về DUY NHẤT một khối JSON hợp lệ. KHÔNG giải thích thêm.
            2. Tất cả thời gian (startTime, endTime) PHẢI ở tương lai (sau tháng 5 năm 2026).
            3. Nếu trong nội dung có dấu ngoặc kép, hãy dùng dấu nháy đơn hoặc escape nó bằng \\".

            Cấu trúc JSON:
            {
              "title": "Tên sự kiện",
              "purpose": "Mục đích sự kiện",
              "description": "Mô tả chi tiết",
              "subject": "Chủ đề",
              "suggestedLocation": "Địa điểm",
              "estimatedParticipants": 100,
              "suggestedStartTime": "2026-06-15T08:30:00",
              "suggestedEndTime": "2026-06-15T11:30:00",
              "programItems": [
                {
                  "title": "Tên phiên",
                  "description": "Mô tả phiên",
                  "startTime": "2026-06-15T08:30:00",
                  "endTime": "2026-06-15T09:00:00",
                  "durationMinutes": 30,
                  "speaker": "Diễn giả",
                  "location": "Phòng/Vị trí"
                }
              ],
              "reasoning": "Lý do đề xuất"
            }
            Văn bản đầu vào: ${rawText}`;
            return axios.post(`${BASE_URL}/ai/api/chat`, { prompt });
        },
    },
    createQuiz: (quizData) => privateApi.post('/quizzes', quizData),
    getQuizzesByEvent: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/quizzes/event/${eventId}`);
    },
    getQuizByPin: (pin) => publicApi.get(`/quizzes/pin/${pin}`), // Public: no auth needed
    startQuiz: (quizId) => privateApi.post(`/quizzes/${quizId}/start`),
    endQuiz: (quizId) => privateApi.post(`/quizzes/${quizId}/end`),
    resetQuiz: (quizId) => privateApi.post(`/quizzes/${quizId}/reset`),
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
    getSurveyByEvent: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/surveys/event/${eventId}`);
    },
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
    getSurveyResponses: (surveyId) => privateApi.get(`/surveys/${surveyId}/responses`),

    // --- Q&A API ---
    getQAMessages: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/qa/event/${eventId}`);
    },
    upvoteQAMessage: (messageId) => privateApi.post(`/qa/${messageId}/upvote`),

    // --- FEEDBACK API ---
    submitFeedback: (eventId, data) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.post(`/api/v1/feedbacks/event/${eventId}`, data);
    },
    getFeedbacksByEvent: (eventId) => {
        const token = localStorage.getItem('accessToken');
        const api = token ? privateApi : publicApi;
        return api.get(`/api/v1/feedbacks/event/${eventId}`);
    },
    replyToFeedback: (feedbackId, reply) => privateApi.patch(`/api/v1/feedbacks/${feedbackId}/reply`, null, { params: { reply } }),

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
    chat: {
        createSession: (data) => {
            const token = localStorage.getItem('accessToken');
            const api = token ? privateApi : publicApi;
            return api.post('/api/v1/chat/sessions', data, { timeout: 60000 });
        },
        sendMessage: (data) => {
            const token = localStorage.getItem('accessToken');
            const api = token ? privateApi : publicApi;
            return api.post('/api/v1/chat/messages', data, { timeout: 60000 });
        },
        analyzeStats: (statsJson) => {
            const prompt = `Hãy phân tích dữ liệu thống kê sự kiện sau và đưa ra nhận xét chuyên sâu: ${statsJson}`;
            const token = localStorage.getItem('accessToken');
            const api = token ? privateApi : publicApi;
            return api.post('/ai/api/chat', { prompt }, { timeout: 90000 });
        },
        extractFromText: (text) => {
            const prompt = `Trích xuất thông tin sự kiện từ văn bản sau và trả về DUY NHẤT định dạng JSON. 
            Yêu cầu các trường: title, subject, suggestedStartTime, suggestedEndTime, suggestedLocation, estimatedParticipants, programItems (mảng các session).
            Văn bản: ${text}`;
            const token = localStorage.getItem('accessToken');
            const api = token ? privateApi : publicApi;
            return api.post('/ai/api/chat', { prompt, isExtraction: true }, { timeout: 90000 });
        },
        generateMediaPost: (eventDetails) => {
            const prompt = `Dựa trên thông tin sự kiện sau, hãy viết một bài đăng truyền thông (Facebook/LinkedIn) hấp dẫn. 
            Yêu cầu: Trả về JSON có cấu trúc {"title": "...", "content": "..."}.
            Dữ liệu: ${eventDetails}`;
            const token = localStorage.getItem('accessToken');
            const api = token ? privateApi : publicApi;
            return api.post('/ai/api/chat', { prompt }, { timeout: 90000 });
        },
    },

    // --- GROUP 10: LOCAL AI ---
    localAi: {
        parseFile: (file) => {
            const formData = new FormData();
            formData.append('file', file);
            return axios.post(`${BASE_URL}/ai/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        chat: (prompt) => axios.post(`${BASE_URL}/ai/api/chat`, { prompt }, { timeout: 60000 }),
    },

    // --- GROUP 11: UTILS ---
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
    rejectLeaveRequest: (organizerId, reason) => privateApi.post(`/events/organizers/${organizerId}/reject-leave${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`),
    updateOrganizerRole: (organizerId, role) => privateApi.patch(`/events/organizers/${organizerId}/role`, null, { params: { role } }),
};

export default eventService;
