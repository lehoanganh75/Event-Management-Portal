import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_NOTIFICATION_API_URL ||
  "http://localhost:8084/api/v1/notifications";

const notificationApi = {
  getNotificationsByUser: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}`);
  },

  getUnreadCount: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/unread-count`);
  },

  getRecentNotifications: (userId, limit = 5) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/recent?limit=${limit}`);
  },

  markAsRead: (notificationId) => {
    return axios.patch(`${API_BASE_URL}/${notificationId}/read`);
  },

  markAllAsRead: (userId) => {
    return axios.patch(`${API_BASE_URL}/user/${userId}/read-all`);
  },

  getNotificationStats: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/stats`);
  },

  searchNotifications: (userId, keyword) => {
    return axios.get(
      `${API_BASE_URL}/user/${userId}/search?keyword=${keyword}`,
    );
  },

  deleteNotification: (notificationId) => {
    return axios.delete(`${API_BASE_URL}/${notificationId}`);
  },
  getAllNotifications: () => {
    return axios.get(`${API_BASE_URL}/admin/all`);
  },
  deleteAllNotifications: (userId) => {
    return axios.delete(`${API_BASE_URL}/user/${userId}`);
  },
};

export default notificationApi;
