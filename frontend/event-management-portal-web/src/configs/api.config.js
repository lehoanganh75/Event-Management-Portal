const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

export const API_ENDPOINTS = {
    // Các tiền tố khớp với cấu hình Kong
    IDENTITY: {
        AUTH: '/identity/auth',
        PROFILES: '/identity/profiles',
        ACCOUNTS: '/identity/accounts'
    }
};

export default API_BASE_URL;