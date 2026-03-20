import axios from "axios";

const API_URL = import.meta.env.VITE_EVENT_API_URL || "http://localhost:8081/api";

export const eventTemplateApi = {
  getAllTemplates: (organizationId, searchTerm, page, size) => {
    return axios.get(`${API_URL}/templates`, {
      params: { organizationId, searchTerm, page, size }
    }).then(res => res.data);
  },
  getAllTemplatesGlobal: (search, page, size) => {
    return axios.get(`${API_URL}/templates/global`, {
      params: { search, page, size }
    }).then(res => res.data);
  },
  createTemplate: (data) => {
    return axios.post(`${API_URL}/templates`, data).then(res => res.data);
  },
  updateTemplate: (id, data) => {
    return axios.put(`${API_URL}/templates/${id}`, data).then(res => res.data);
  },
  deleteTemplate: (id) => {
    return axios.delete(`${API_URL}/templates/${id}`).then(res => res.data);
  }
};