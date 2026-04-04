import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

// Dòng này cực kỳ quan trọng để bạn check trên Console F12 xem nó đang nhận gì
console.log("BASE_URL_GATEWAY:", GATEWAY_URL);

const axiosClient = axios.create({
    baseURL: GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, 
});

// Request interceptor - thêm Access Token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý 401 + refresh token
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error();

                const res = await axios.post(`${GATEWAY_URL}/identity/auth/refresh`, { refreshToken });

                const { accessToken, refreshToken: newRefreshToken } = res.data;

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return gatewayApi(originalRequest);
            } catch (err) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;