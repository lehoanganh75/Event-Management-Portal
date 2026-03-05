import axios from "axios";

const BASE_URL = "http://localhost:8080/api/templates";

export const eventTemplateApi = {
  getAllTemplates: async (orgId, search = "", page = 0, size = 10) => {
    const response = await axios.get(`${BASE_URL}/all`, {
      params: {
        organizationId: orgId,
        search: search,
        page: page,
        size: size,
      },
    });
    return response.data;
  },

  applyTemplate: async (templateId, accountId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${templateId}/apply?accountId=${accountId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi áp dụng bản mẫu:", error);
      throw error;
    }
  },

  createTemplate: async (templateData) => {
    try {
      const response = await axios.post(BASE_URL, templateData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo bản mẫu mới:", error);
      throw error;
    }
  },

  deleteTemplate: async (templateId) => {
    try {
      await axios.delete(`${BASE_URL}/${templateId}`);
    } catch (error) {
      console.error("Lỗi khi xóa bản mẫu:", error);
      throw error;
    }
  },
};
