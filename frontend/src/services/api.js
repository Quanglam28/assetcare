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

// Request Interceptor: Luôn gửi cookie credentials và đính kèm Bearer Token nếu có
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
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
        const reqUrl = error.config?.url || '';
        const isAuthCheck = reqUrl.includes('/auth/me') || reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');
        
        // Không redirect nếu là request kiểm tra phiên auth/me ban đầu hoặc đang ở public pages
        if (!isAuthCheck) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register' && !currentPath.startsWith('/device/')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
