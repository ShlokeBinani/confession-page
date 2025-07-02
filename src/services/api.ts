import axios from 'axios';
import { PaginationData, ConfessionFormData } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const confessionService = {
  getConfessions: async (params?: any): Promise<PaginationData> => {
    const response = await axios.get(`${API_BASE_URL}/confessions`, { params });
    if (Array.isArray(response.data)) {
      return {
        confessions: response.data,
        totalPages: 1,
        currentPage: 1,
        total: response.data.length,
      };
    }
    return response.data as PaginationData;
  },
  createConfession: async (data: FormData | ConfessionFormData) => {
    if (data instanceof FormData) {
      // Audio confession
      const response = await axios.post(`${API_BASE_URL}/confessions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Text confession
      const response = await axios.post(`${API_BASE_URL}/confessions`, data);
      return response.data;
    }
  }
};
