import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s để chờ Render Free Tier khởi động (Cold Start) khi đang sleep
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request Interceptor: Luôn gửi cookie credentials và đính kèm custom CSRF header
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
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
