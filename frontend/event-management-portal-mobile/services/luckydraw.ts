import { DrawResultResponse, LuckyDraw } from "@/types/event";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
// import { logout } from "@/services/auth"; // Giả sử bạn có hàm này

const BASE_URL = "http://192.168.2.3:8084"; // Tốt nhất nên đưa vào .env

export const luckyDrawApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Thêm timeout 10s để tránh app treo vô tận khi server chết
});

luckyDrawApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("SecureStore Error:", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

luckyDrawApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      console.warn("Session expired");
      // Thực hiện đẩy ra màn hình Login tại đây
    }
    return Promise.reject(error);
  },
);

// Sử dụng hằng số để tránh gõ sai chính tả URL
const PATH = "/lucky-draws";

export const luckyDrawService = {
  getByEventId: async (id: string): Promise<LuckyDraw> => {
    const { data } = await luckyDrawApi.get(`${PATH}/events/${id}`);
    return data;
  },

  create: async (data: Partial<LuckyDraw>): Promise<LuckyDraw> => {
    const { data: result } = await luckyDrawApi.post(PATH, data);
    return result;
  },

  update: async (id: string, data: Partial<LuckyDraw>): Promise<LuckyDraw> => {
    const { data: result } = await luckyDrawApi.put(`${PATH}/${id}`, data);
    return result;
  },

  spin: async (id: string): Promise<DrawResultResponse> => {
    const { data } = await luckyDrawApi.post(`${PATH}/${id}/spin`);
    return data;
  },

  getEntry: async (luckyDrawId: string) => {
    const { data } = await luckyDrawApi.get(
      `${PATH}/draw-entry/${luckyDrawId}`,
    );
    return data;
  },

  joinDraw: async (luckyDrawId: string) => {
    const { data } = await luckyDrawApi.post(`${PATH}/${luckyDrawId}`);
    return data;
  },

  activate: async (luckyDrawId: string): Promise<void> => {
    await luckyDrawApi.patch(`/lucky-draws/${luckyDrawId}/activate`);
  },

  getById: async (id: string): Promise<LuckyDraw> => {
    const { data } = await luckyDrawApi.get(`${PATH}/${id}`);
    return data;
  },
};
