import axios from 'axios';
import API_BASE_URL from '../configs/api.config';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn Token vào Header
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Xử lý lỗi tập trung (Optionally)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Phiên đăng nhập hết hạn.");
            // localStorage.removeItem("accessToken");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;