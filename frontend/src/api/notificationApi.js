import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/notifications";

const notificationApi = {
  getNotificationsByUser: (userProfileId) => {
    return axios.get(`${API_BASE_URL}/user/${userProfileId}`);
  },

  getUnreadCount: (userProfileId) => {
    return axios.get(`${API_BASE_URL}/user/${userProfileId}/unread-count`);
  },

  markAsRead: (id) => {
    return axios.patch(`${API_BASE_URL}/${id}/read`);
  }
};

export default notificationApi;