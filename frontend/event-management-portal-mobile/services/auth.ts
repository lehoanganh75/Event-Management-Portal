import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  AuthResponse,
  LoginPayload,
  LogoutPayload,
  RegisterPayload,
} from "../types/auth";

// ĐỊA CHỈ IP BACKEND (Chỉ để port, path sẽ thêm ở hàm con)
const BASE_URL = "http://192.168.2.3:8083";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- QUẢN LÝ LOGOUT CALLBACK ---
let logoutCallback: () => void = () => {};

export const injectLogout = (cb: () => void) => {
  logoutCallback = cb;
};

export const triggerLogout = () => {
  try {
    logoutCallback();
  } catch (e) {
    console.error("triggerLogout error:", e);
  }
};

// --- REQUEST INTERCEPTOR: Tự động gắn Token vào mọi yêu cầu ---
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- RESPONSE INTERCEPTOR: Xử lý Refresh Token khi lỗi 401 ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa thử lại lần nào
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await SecureStore.getItemAsync("refreshToken");
        if (!refresh) {
          throw new Error("No refresh token available");
        }

        // Gọi API Refresh Token bằng instance axios mới (tránh loop)
        const resp = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: refresh,
        });

        const { accessToken, refreshToken: newRefreshToken } = resp.data;

        if (accessToken) {
          // Lưu token mới vào bộ nhớ an toàn
          await SecureStore.setItemAsync("accessToken", accessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync("refreshToken", newRefreshToken);
          }

          // Cập nhật lại header và thực hiện lại request ban đầu
          api.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (e) {
        // Nếu refresh thất bại -> Xóa sạch và yêu cầu đăng nhập lại
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        triggerLogout();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

// --- CÁC HÀM API ---

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  // Kết quả URL: http://192.168.2.3:8083/auth/login
  const res = await api.post<AuthResponse>("/auth/login", payload);
  return res.data;
};

export const register = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", payload);
  return res.data;
};

export const logout = async (payload: LogoutPayload) => {
  const res = await api.post("/auth/logout", payload);
  return res.data;
};

export const verifyOtp = async (username: string, otp: string) => {
  const res = await api.post("/auth/verify-otp", { username, otp });
  return res.data;
};

export const resendOtp = async (usernameOrEmail: string) => {
  const res = await api.post("/auth/resend-otp", { username: usernameOrEmail });
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", null, {
    params: { email },
  });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await api.post("/auth/reset-password", null, {
    params: { token, newPassword },
  });
  return res.data;
};

export const getMyProfile = async () => {
  const res = await api.get("/profiles/me");
  return res.data;
};

export default {
  api,
  login,
  register,
  logout,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  injectLogout,
  triggerLogout,
  getMyProfile
};
