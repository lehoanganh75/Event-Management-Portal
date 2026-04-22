const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    // Các tiền tố khớp với cấu hình Kong
    IDENTITY: {
        AUTH: '/identity/auth',
        PROFILES: '/identity/profiles',
        SEARCH_PROFILES: '/identity/profiles/search',
        ACCOUNTS: '/identity/accounts'
    },
    NOTIFICATIONS: '/notification/notifications',
    POSTS: '/event/posts',
    TEMPLATES: '/event/templates',
    EVENTS: {
        BASE: '/event/events',
        PLANS: '/event/plans',
        ADMIN: '/event/admin',
        ORGANIZATIONS: '/event/organizations',
        REGISTRATIONS: {
            BASE: '/event/registrations',
            CANCEL: '/event/registrations/cancel',
            CHECK: (eventId) => `/event/registrations/check/${eventId}`,
            REGISTER: (eventId) => `/event/registrations/${eventId}`,
            GET_QR: (registrationId) => `/event/registrations/${registrationId}/qr`
        }
    },
    LUCKY_DRAW: {
        ENTRIES: (drawId) => `/lucky-draw/entries/${drawId}`
    }
};

export default API_BASE_URL;