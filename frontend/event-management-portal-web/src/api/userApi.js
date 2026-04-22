import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

export const userApi = {
    searchProfiles: (keyword) => 
        axiosClient.get(API_ENDPOINTS.IDENTITY.SEARCH_PROFILES, {
            params: { keyword }
        }),
    
    getMe: () => axiosClient.get(`${API_ENDPOINTS.IDENTITY.PROFILES}/me`),
    updateMe: (data) => axiosClient.put(`${API_ENDPOINTS.IDENTITY.PROFILES}/me`, data),
    
    accounts: {
        delete: (id) => axiosClient.delete(`${API_BASE_URL}/accounts/${id}`),
        updateStatus: (id, status) => axiosClient.put(`${API_BASE_URL}/accounts/${id}/status`, { status }),
    }
};