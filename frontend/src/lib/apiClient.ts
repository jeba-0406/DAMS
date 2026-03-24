import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('dams_token') || localStorage.getItem('dams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    console.error('API Error Response:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.warn('Unauthorized access detected. Clearing auth and redirecting to login.');
      const msg = error.response?.data?.message || 'Unauthorized';
      alert('AUTH ERROR (401): ' + msg);
      Cookies.remove('dams_token');
      localStorage.removeItem('dams_token');
      localStorage.removeItem('dams_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
