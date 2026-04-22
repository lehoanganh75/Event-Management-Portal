import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

// --- HELPERS: MAPPING DATA ---
const mapPost = (p) => {
    if (!p) return null;
    const createdDate = p.createdAt ? new Date(p.createdAt) : null;
    const updatedDate = p.updatedAt ? new Date(p.updatedAt) : null;

    return {
        ...p,
        title: p.title || "Không có tiêu đề",
        eventName: p.event?.title || "N/A",
        date: createdDate ? createdDate.toLocaleDateString("vi-VN") : "N/A",
        fullDateTime: createdDate ? createdDate.toLocaleString("vi-VN") : "",
        updatedAt: updatedDate,
        commentCount: Array.isArray(p.comments) ? p.comments.length : 0,
    };
};

// --- MAIN API OBJECT ---
export const contentApi = {
    // 1. QUẢN LÝ BÀI VIẾT (POSTS)
    posts: {
        getAll: (params = {}) => {
            const queryParams = {
                searchTerm: params.searchTerm || "",
                status: params.status || undefined,
                page: params.page || 0,
                size: params.size || 10,
                sort: "createdAt,desc",
            };
            return axiosClient.get(API_ENDPOINTS.POSTS, { params: queryParams })
                .then((res) => ({
                    ...res,
                    data: {
                        ...res.data,
                        content: Array.isArray(res.data.content) 
                            ? res.data.content.map(mapPost) 
                            : [],
                    },
                }));
        },

        getByUser: (userId) => axiosClient.get(`${API_ENDPOINTS.POSTS}/user/${userId}`),

        getById: (id) => axiosClient.get(`${API_ENDPOINTS.POSTS}/${id}`)
            .then((res) => ({ ...res, data: mapPost(res.data) })),

        create: (postData) => axiosClient.post(API_ENDPOINTS.POSTS, postData)
            .then((res) => ({ ...res, data: mapPost(res.data) })),

        update: (id, postData) => axiosClient.put(`${API_ENDPOINTS.POSTS}/${id}`, postData)
            .then((res) => ({ ...res, data: mapPost(res.data) })),

        delete: (id) => axiosClient.delete(`${API_ENDPOINTS.POSTS}/${id}`),
    },

    // 2. QUẢN LÝ TEMPLATES (EVENT TEMPLATES)
    templates: {
        getAll: (organizationId, searchTerm, page, size) => 
            axiosClient.get(`${API_ENDPOINTS.TEMPLATES}/all`, {
                params: { organizationId, search: searchTerm, page, size }
            }).then(res => res.data),

        getAllGlobal: (search, page, size) => 
            axiosClient.get(`${API_ENDPOINTS.TEMPLATES}/global`, {
                params: { search, page, size }
            }).then(res => res.data),

        search: (searchTerm, page, size) => 
            axiosClient.get(`${API_ENDPOINTS.TEMPLATES}/all`, {
                params: { search: searchTerm, page, size }
            }).then(res => res.data),

        create: (data) => axiosClient.post(API_ENDPOINTS.TEMPLATES, data)
            .then(res => res.data),

        update: (id, data) => axiosClient.put(`${API_ENDPOINTS.TEMPLATES}/${id}`, data)
            .then(res => res.data),

        delete: (id) => axiosClient.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`)
            .then(res => res.data),

        toggleStar: (id) => axiosClient.patch(`${API_ENDPOINTS.TEMPLATES}/${id}/star`)
            .then(res => res.data),
    }
};