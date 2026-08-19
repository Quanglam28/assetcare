import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Bearer Token nếu có trong localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý 401 Unauthorized tự động và trích xuất payload
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Chỉ chuyển hướng nếu không phải đang ở trang /login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
