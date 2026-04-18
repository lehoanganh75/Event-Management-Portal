import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

export const authApi = {
    // 1. Đăng nhập
    login: (credentials) => 
        axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

    // 2. Đăng ký tài khoản mới
    register: (userData) => 
        axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),

    // 3. Lấy thông tin hồ sơ cá nhân (Token đã được axiosClient tự gắn)
    getMyProfile: () => 
        axiosClient.get(API_ENDPOINTS.AUTH.MY_PROFILE),

    // 4. Cập nhật thông tin hồ sơ
    updateProfile: (data) => 
        axiosClient.put(API_ENDPOINTS.AUTH.MY_PROFILE, data),

    // 5. Đổi mật khẩu (Sử dụng Template Literal dựa trên BASE của AUTH)
    changePassword: (passwordData) => 
        axiosClient.patch(`${API_ENDPOINTS.AUTH.BASE}/change-password`, passwordData),

    // 6. Đăng xuất
    logout: (refreshToken) => 
        axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, null, {
            params: { refreshToken }
        }),
        
    // 7. Quên mật khẩu
    forgotPassword: (email) => 
        axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, null, {
            params: { email }
        }),

    // 8. Đặt lại mật khẩu (Dùng trực tiếp endpoint RESET_PASSWORD đã định nghĩa)
    resetPassword: (token, newPassword) => 
        axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, null, {
            params: { token, newPassword }
        }),
};

export default authApi;