import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(new Error(`Request failed: ${error.message}`));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

// Auth APIs
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => api.post('/users', userData),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/transactions', { params }),
  
  getBySchool: (schoolId: string, params?: Record<string, unknown>) =>
    api.get(`/transactions/school/${schoolId}`, { params }),
  
  getStatus: (orderId: string) =>
    api.get(`/transactions/status/${orderId}`),
};

// Payment APIs
export const paymentAPI = {
  createPayment: (paymentData: Record<string, unknown>) =>
    api.post('/payment/create', paymentData),
  
  getPaymentStatus: (orderId: string) =>
    api.get(`/payment/status/${orderId}`),
};