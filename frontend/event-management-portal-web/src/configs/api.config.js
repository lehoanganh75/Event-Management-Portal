// Sử dụng VITE_ cho Vite hoặc REACT_APP_ cho Create React App
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `/identity/auth/login`,
        REGISTER: `/identity/auth/register`,
        VERIFY: `/identity/auth/verify`,
        MY_PROFILE: `/identity/profiles/me`,
        SEARCH_PROFILES: `/identity/api/profiles/search`,
        LOGOUT: `/identity/auth/logout`,
        FORGOT_PASSWORD: `/identity/auth/forgot-password`,
        RESET_PASSWORD: `/identity/auth/reset-password`,
    },
    EVENTS: {
        BASE: `/events/events`,
        PLANS: `/events/plans`,
        BY_STATUS: `/events/events/by-statuses`,
        MY_EVENTS: `/events/events/my-events`,
        ADMIN: `/events/admin`,
        CHECK_REGISTRATION: (eventId) => `/events/registrations/check/${eventId}`,
        REGISTER: (eventId) => `/events/registrations/${eventId}`,
        GET_QR: (registrationId) => `/events/registrations/${registrationId}/qr`,
    },
    REGISTRATIONS: {
        BASE: `/events/registrations`,
        CHECK: `/events/registrations/check`,
        CANCEL: `/events/registrations/cancel`,
    },
    NOTIFICATIONS: `/notification/api`,
    LUCKY_DRAW: {
        CREATE_ENTRY: (drawId) => `/lucky-draw/api/draw-entries/${drawId}`,
        BASE: `/lucky-draw/api/lucky-draws`,
        RESULTS: `/lucky-draw/api/draw-results`,
        ENTRIES: (drawId) => `/lucky-draw/api/draw-entries/${drawId}`,
    },
};

export default API_BASE_URL;