import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

export const authApi = {
    // 1. Đăng nhập
    login: (credentials) => 
        axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

    // 2. Đăng ký tài khoản mới
    register: (userData) => 
        axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),

    // 3. Lấy thông tin hồ sơ cá nhân (Dùng Token trong axiosClient)
    getMyProfile: () => 
        axiosClient.get(API_ENDPOINTS.AUTH.MY_PROFILE),

    // 4. Cập nhật thông tin hồ sơ
    updateProfile: (data) => 
        axiosClient.put(API_ENDPOINTS.AUTH.MY_PROFILE, data),

    // 5. Đổi mật khẩu
    changePassword: (passwordData) => 
        axiosClient.patch(`${API_ENDPOINTS.AUTH.MY_PROFILE}/change-password`, passwordData),

    // 6. Đăng xuất (Vô hiệu hóa Refresh Token ở Server)
    logout: (refreshToken) => 
        axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, null, {
            params: { refreshToken }
        }),
        
    // 7. Quên mật khẩu (Bổ sung nếu cần)
    forgotPassword: (email) => 
        axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, null, {
            params: { email }
        }),

    resetPassword: (token, newPassword) => 
        axiosClient.post(`${API_ENDPOINTS.AUTH.BASE}/reset-password`, null, {
            params: { token, newPassword }
        }),
};

export default authApi;