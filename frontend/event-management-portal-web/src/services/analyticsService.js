import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/analytics';

const privateApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const analyticsService = {
  getEventStats: async (eventId) => {
    const response = await privateApi.get(`/${eventId}`);
    return response.data;
  },

  getAISummary: async (eventId) => {
    const response = await privateApi.get(`/ai-summary/${eventId}`);
    return response.data;
  },

  generateAISummary: async (eventId) => {
    const response = await privateApi.post(`/ai-summary/${eventId}/generate`);
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await privateApi.get(`/dashboard`);
    return response.data;
  },

  exportAISummary: async (eventId) => {
    const response = await privateApi.get(`/ai-summary/${eventId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }
};

export default analyticsService;
