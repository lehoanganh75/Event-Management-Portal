import axios from 'axios';

// Nếu dùng Kong API Gateway thì trả về đây
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

const axiosClient = axios.create({
    baseURL: GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, 
});

// Request interceptor - định tuyến port trực tiếp bypass Kong + thêm token
axiosClient.interceptors.request.use(
    (config) => {
        const originalUrl = config.url;

        // Tự động định tuyến để bypass Kong Gateway (giả lập giống Kong strip_path)
        if (config.url.startsWith('/identity/')) {
            config.baseURL = 'http://localhost:8083';
            config.url = config.url.replace('/identity/', '/');
        } else if (config.url.startsWith('/event/')) {
            config.baseURL = 'http://localhost:8082';
            
            // Rewrite mapping cho các controller trong Event-service
            if (config.url.startsWith('/event/events')) {
                config.url = config.url.replace('/event/events', '/events');
            } else if (config.url.startsWith('/event/plans')) {
                config.url = config.url.replace('/event/plans', '/events/plans');
            } else if (config.url.startsWith('/event/my-events')) {
                config.url = config.url.replace('/event/my-events', '/events/my-events');
            } else if (config.url.startsWith('/event/posts')) {
                config.url = config.url.replace('/event/posts', '/posts');
            } else if (config.url.startsWith('/event/admin')) {
                config.url = config.url.replace('/event/admin', '/events/admin');
            } else if (config.url.startsWith('/event/templates')) {
                config.url = config.url.replace('/event/templates', '/templates');
            } else if (config.url.startsWith('/event/organizations')) {
                config.url = config.url.replace('/event/organizations', '/organizations');
            } else {
                // Fallback mặc định: chỉ xóa tiền tố service nếu không khớp mẫu trên
                config.url = config.url.replace('/event/', '/');
            }
        } else if (config.url.startsWith('/notification/')) {
            config.baseURL = 'http://localhost:8085';
            // Đồng bộ Endpoint: mapping /notification/notifications/... sang /notifications/...
            if (config.url.startsWith('/notification/notifications')) {
                config.url = config.url.replace('/notification/notifications', '/notifications');
            } else {
                config.url = config.url.replace('/notification/', '/');
            }
        } else if (config.url.startsWith('/lucky-draw/')) {
            config.baseURL = 'http://localhost:8084';
            config.url = config.url.replace('/lucky-draw/', '/');
        } else if (config.url.startsWith('/analytics/')) {
            config.baseURL = 'http://localhost:8081';
            config.url = config.url.replace('/analytics/', '/');
        }

        // Xử lý lỗi double slash khi nối baseURL + url
        if (config.url.startsWith('//')) {
            config.url = config.url.substring(1);
        }

        // // Debug routing trong môi trường dev
        // if (import.meta.env.DEV) {
        //     console.log(`[Axios Routing] ${originalUrl} -> ${config.baseURL}${config.url}`);
        // }

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
                if (!refreshToken) throw new Error("No refresh token");

                // Hardcode port 8083 cho Identity Service thay vì dùng GATEWAY_URL
                const res = await axios.post(`http://localhost:8083/identity/auth/refresh`, { refreshToken });

                const { accessToken, refreshToken: newRefreshToken } = res.data;

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosClient(originalRequest);
            } catch (err) {
                // Refresh thất bại (hết hạn hoàn toàn hoặc không có token)
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Nếu request yêu cầu "im lặng" (ví dụ: load user lúc khởi tạo), không redirect
                if (originalRequest._silent) {
                    return Promise.reject(error);
                }

                // THỬ LẠI LẦN CUỐI KHÔNG CÓ TOKEN (Cho phép truy cập public nếu endpoint hỗ trợ)
                // Xóa Header Auth để backend nhận diện là khách
                delete originalRequest.headers.Authorization;
                
                try {
                    return await axiosClient(originalRequest);
                } catch (retryError) {
                    // Nếu vẫn 401 (endpoint thực sự private), mới chuyển hướng sang Login
                    if (retryError.response?.status === 401) {
                        window.location.href = '/login';
                    }
                    return Promise.reject(retryError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;