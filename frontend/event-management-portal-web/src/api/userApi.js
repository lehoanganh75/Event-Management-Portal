import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

export const userApi = {
    searchProfiles: (keyword) => 
        axiosClient.get(API_ENDPOINTS.AUTH.SEARCH_PROFILES, {
            params: { keyword }
        }),
    
    accounts: {
        getAll: () => axiosClient.get(`${API_BASE_URL}/accounts`), // Cần API_BASE_URL từ config
        update: (id, data) => axiosClient.put(`${API_BASE_URL}/accounts/${id}`, data),
        delete: (id) => axiosClient.delete(`${API_BASE_URL}/accounts/${id}`),
        updateStatus: (id, status) => axiosClient.put(`${API_BASE_URL}/accounts/${id}/status`, { status }),
    }
};