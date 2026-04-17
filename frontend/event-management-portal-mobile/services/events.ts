import { triggerLogout } from "@/services/auth";
import { Event } from "@/types/event";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// 1. Chỉ để Base URL dừng lại ở Port
const EVENTS_BASE = "http://192.168.2.3:8082";

const eventsApi = axios.create({
  baseURL: EVENTS_BASE,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor
eventsApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
eventsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      const status = error?.response?.status;
      if (status === 401) {
        console.warn("Session expired (eventsApi)");
        triggerLogout();
      }
    } catch (e) {
      console.error("eventsApi interceptor error:", e);
    }
    return Promise.reject(error);
  },
);

/** --- CÁC HÀM GỌI API: Thêm /events vào đầu mỗi path --- **/

export const getAllActiveEvents = async (): Promise<Event[]> => {
  try {
    // Gọi: http://192.168.2.3:8082/events
    const response = await eventsApi.get("/events");
    return response.data;
  } catch (err) {
    console.error("getAllActiveEvents error:", err);
    throw err;
  }
};

export const getOngoingEvents = async (): Promise<Event[]> => {
  try {
    // Gọi: http://192.168.2.3:8082/events/ongoing
    const response = await eventsApi.get("/events/ongoing");
    return response.data;
  } catch (err) {
    console.error("getOngoingEvents error:", err);
    throw err;
  }
};

export const getUpcomingWeekEvents = async (): Promise<Event[]> => {
  const response = await eventsApi.get("/events/upcoming-week");
  return response.data;
};

export const getFeaturedEvents = async (): Promise<Event[]> => {
  const response = await eventsApi.get("/events/featured");
  return response.data;
};

export const getAdminAllEvents = async (): Promise<Event[]> => {
  const response = await eventsApi.get("/events/admin/all");
  return response.data;
};

export const getMyOrganizingEvents = async (): Promise<Event[]> => {
  const response = await eventsApi.get("/events/my-organizing");
  return response.data;
};

export const getMyPresentingEvents = async (): Promise<Event[]> => {
  const response = await eventsApi.get("/events/my-presenting");
  return response.data;
};

export const getMyRegistrations = async (): Promise<any[]> => {
  const response = await eventsApi.get("/events/my-registrations");
  return response.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await eventsApi.get(`/events/${id}`);
  return response.data;
};

export const getMyEventsByRole = async (
  role: string = "ALL",
): Promise<Event[]> => {
  const response = await eventsApi.get("/events/my-events", {
    params: { role },
  });
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await eventsApi.delete(`/events/delete/${id}`);
};

export const registerEvent = async (eventId: string): Promise<any> => {
  const { data } = await eventsApi.post(`/registrations/register/${eventId}`);
  return data;
};

// Lấy thông tin vé dựa trên eventId và Token người dùng
export const getTicketByEventId = async (eventId: string): Promise<any> => {
  // Đảm bảo URL này khớp với cấu hình RequestMapping ở Controller (VD: /api/registrations)
  const { data } = await eventsApi.get(`/registrations/${eventId}`);
  return data;
};

export default eventsApi;
