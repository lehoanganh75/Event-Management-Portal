import axios from "axios";

const BASE_URL ="http://localhost:8084/api/v1";

const API_BASE_URL = `${BASE_URL}/notifications`;

const notificationApi = {
  getNotificationsByUser: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}`);
  },

  getNotificationsPaged: (userId, page = 0, size = 20) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/paged`, {
      params: { page, size }
    });
  },

  getUnreadNotifications: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/unread`);
  },

  getUnreadCount: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/unread-count`);
  },

  getRecentNotifications: (userId, limit = 5) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/recent`, {
      params: { limit }
    });
  },

  getNotificationsByType: (userId, type) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/type/${type}`);
  },

  getNotificationsByDateRange: (userId, startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/date-range`, {
      params: { startDate, endDate }
    });
  },

  searchNotifications: (userId, keyword) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/search`, {
      params: { keyword }
    });
  },

  getNotificationStats: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/stats`);
  },

  hasUnreadNotifications: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/has-unread`);
  },

  getNotificationById: (id) => {
    return axios.get(`${API_BASE_URL}/${id}`);
  },

  exportNotifications: (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}/export`);
  },

  markAsRead: (notificationId) => {
    return axios.patch(`${API_BASE_URL}/${notificationId}/read`);
  },

  markMultipleAsRead: (notificationIds) => {
    return axios.patch(`${API_BASE_URL}/read-batch`, notificationIds);
  },

  markAllAsRead: (userId) => {
    return axios.patch(`${API_BASE_URL}/user/${userId}/read-all`);
  },

  createNotification: (notificationData) => {    
    const payload = {
      userProfileId: notificationData.userProfileId,
      type: notificationData.type,
      title: notificationData.title?.substring(0, 255),
      message: notificationData.message,
      relatedEntityId: notificationData.relatedEntityId,
      relatedEntityType: notificationData.relatedEntityType,
      actionUrl: notificationData.actionUrl,
      priority: notificationData.priority
    };
    
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        delete payload[key];
      }
    });
    
    return axios.post(`${API_BASE_URL}`, payload)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  },

  sendBulkNotification: (request) => {
    return axios.post(`${API_BASE_URL}/bulk`, request);
  },

  sendRealtimeNotification: (request) => {
    return axios.post(`${API_BASE_URL}/realtime`, request);
  },

  deleteNotification: (notificationId) => {
    return axios.delete(`${API_BASE_URL}/${notificationId}`);
  },

  deleteMultipleNotifications: (notificationIds) => {
    return axios.delete(`${API_BASE_URL}/batch`, { data: notificationIds });
  },

  deleteAllNotifications: (userId) => {
    return axios.delete(`${API_BASE_URL}/user/${userId}`);
  },

  cleanupOldNotifications: (daysToKeep = 30) => {
    return axios.delete(`${API_BASE_URL}/cleanup`, {
      params: { daysToKeep }
    });
  },

  getAllNotifications: () => {
    return axios.get(`${API_BASE_URL}/admin/all`);
  },
};

export default notificationApi;