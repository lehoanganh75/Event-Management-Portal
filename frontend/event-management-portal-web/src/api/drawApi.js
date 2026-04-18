import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../configs/api.config";

export const drawApi = {
    campaigns: {
        getAll: () => axiosClient.get(API_ENDPOINTS.LUCKY_DRAWS.BASE),
        
        getById: (id) => axiosClient.get(`${API_ENDPOINTS.LUCKY_DRAWS.BASE}/${id}`),
        
        create: (data) => axiosClient.post(API_ENDPOINTS.LUCKY_DRAWS.BASE, data),
        
        update: (id, data) => axiosClient.put(`${API_ENDPOINTS.LUCKY_DRAWS.BASE}/${id}`, data),
        
        delete: (id, payload) => axiosClient.put(`${API_ENDPOINTS.LUCKY_DRAWS.BASE}/${id}`, payload),
    },
    
    results: {
        getAll: () => axiosClient.get(API_ENDPOINTS.LUCKY_DRAWS.RESULTS),
        
        getByCampaign: (drawId) => axiosClient.get(`${API_ENDPOINTS.LUCKY_DRAWS.RESULTS}/lucky-draw/${drawId}`),
    }
};