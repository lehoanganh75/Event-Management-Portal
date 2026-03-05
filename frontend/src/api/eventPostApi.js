import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

const mapPost = (p) => {
  const createdDate = p.createdAt ? new Date(p.createdAt) : null;
  const updatedDate = p.updatedAt ? new Date(p.updatedAt) : null;

  return {
    id: p.id,
    title: p.title || "Không có tiêu đề",
    content: p.content || "",
    postType: p.postType || "Announcement",
    status: p.status || "Draft",
    eventName: p.event?.title || "N/A",
    eventId: p.event?.id,
    date: createdDate ? createdDate.toLocaleDateString("vi-VN") : "N/A",
    fullDateTime: createdDate ? createdDate.toLocaleString("vi-VN") : "",
    updatedAt: updatedDate,
    commentCount: Array.isArray(p.comments) ? p.comments.length : 0,
    comments: p.comments || [],
    createdBy: p.createdByAccountId || "Hệ thống",
    isDeleted: p.isDeleted || false,
  };
};

// --- API FUNCTIONS ---

/**
 * Lấy danh sách bài viết (có phân trang và filter)
 * @param {Object} params - { searchTerm, status, page, size }
 */
export const getAllPosts = (params = {}) =>
  api.get("/posts", {
    params: {
      searchTerm: params.searchTerm || "",
      status: params.status || undefined,
      page: params.page || 0,
      size: params.size || 10,
      sort: "createdAt,desc",
    },
  }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      content: Array.isArray(res.data.content) ? res.data.content.map(mapPost) : [],
    },
  }));

/**
 * Lấy chi tiết một bài viết theo ID
 */
export const getPostById = (id) =>
  api.get(`/posts/${id}`).then((res) => ({
    ...res,
    data: res.data ? mapPost(res.data) : null,
  }));

/**
 * Tạo mới bài viết
 */
export const createPost = (postData) =>
  api.post("/posts", postData).then((res) => ({
    ...res,
    data: res.data ? mapPost(res.data) : null,
  }));

/**
 * Cập nhật bài viết
 */
export const updatePost = (id, postData) =>
  api.put(`/posts/${id}`, postData).then((res) => ({
    ...res,
    data: res.data ? mapPost(res.data) : null,
  }));

/**
 * Xóa bài viết (Soft delete)
 */
export const deletePost = (id) => api.delete(`/posts/${id}`);

export default {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};